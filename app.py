
from flask import Flask, request, jsonify, render_template, session
from flask_session import Session
# from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.embeddings import HuggingFaceInstructEmbeddings
from langchain_community.vectorstores.faiss import FAISS
from langchain_community.llms.huggingface_endpoint import HuggingFaceEndpoint
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain

from langchain_core.prompts import PromptTemplate
from transformers import AutoModelForCausalLM, AutoTokenizer
import sys

app = Flask(__name__)
# app.config['SESSION_TYPE'] = 'filesystem'
# app.config['SECRET_KEY'] = 'supersecretkey'
# Session(app)
conversation_store = {}


# Configuration for file uploads
# UPLOAD_FOLDER = 'uploads'
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS



def extract_text_from_pdf(file):
    pdf_text = ""
    try:
        reader = PdfReader(file)
        for page in reader.pages:
            pdf_text += page.extract_text()
    except Exception as e:
        print(f"Error reading PDF file: {e}")
    return pdf_text


def get_text_chuncks(text):
    splitter = CharacterTextSplitter(
        separator='\n',
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = splitter.split_text(text)
    return chunks

def make_vectore_store(chunks):
    embadiing = HuggingFaceInstructEmbeddings(model_name="hkunlp/instructor-xl")
    vector = FAISS.from_texts(texts=chunks, embedding=embadiing)
    
    return vector

def get_conversation(vector):
    hf_model_id = "google/flan-t5-xxl"    
    hf_endpoint_url = f"https://api-inference.huggingface.co/models/{hf_model_id}"

    # Prompt
    template = """You are an AI assistant your name is K2S to help the user to get answers Use the following pieces of context to answer the question at the end.
    If you don’t know the answer, just say that you don’t know, don’t try to make up an answer.
    Use three sentences maximum and keep the answer as concise as possible.
    {context}
    Question: {question}
    Helpful Answer:"""

    prompt = PromptTemplate(
                            template=template,input_variables=["context", "question"])
    llm = HuggingFaceEndpoint(
        task="text2text-generation",
        endpoint_url=hf_endpoint_url,
    )

    # question_generator_chain = LLMChain(llm=llm, prompt=prompt)
    memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True
                                      ,model_kwargs={"max_new_tokens": 200}, top_k=3)
    # conversation = LLMChain(llm=llm, prompt=prompt, verbose=True, memory=memory)
    conversation =  ConversationalRetrievalChain.from_llm(
    llm=llm,
    memory=memory,
    retriever=vector.as_retriever(search_type="similarity_score_threshold", search_kwargs={"score_threshold": 0.5, "k":2}), 
    combine_docs_chain_kwargs={"prompt": prompt},  
    # return_source_documents=True
    )

    return conversation


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        # Process the PDF file
        pdf_text = extract_text_from_pdf(file)
        chunks = get_text_chuncks(pdf_text)
        vector = make_vectore_store(chunks)
        global conversation 
        conversation = get_conversation(vector)
        # session_id = str(uuid.uuid4())
        # session['session_id'] = session_id
        # conversation_store[session_id] = conversation

        return jsonify({'success': 'File uploaded successfully'}), 200
    else:
        return jsonify({'error': 'File type not allowed'}), 400


@app.route('/ask', methods=['POST'])
def ask_question():

    question = request.json.get('question')
    if not question:
        return jsonify({'error': 'No question provided'}), 400
    response = conversation.invoke({"question": question})
    print(response)
    answer = response['answer']
    
    return jsonify({'answer': answer})

if __name__ == '__main__':
    import os
    load_dotenv()
    os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
    app.run(host='0.0.0.0',port='5000',debug=True)
