        // Handle send message
        function sendMessage() {
            const userInput = $('#userInput').val();
            if (userInput.trim() === '') return;
            $.ajax({
                    url: '/ask',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ question: userInput }),
                    success: function(data) {
                        const chatDiv = $('#chatMessages');
                        const p = $('<p></p>').html(`<strong>You:</strong> ${userInput}<br><strong>Bot:</strong> ${data.answer}`);
                        chatDiv.append(p);
                    },
                    error: function(xhr) {
                        alert(xhr.responseJSON.error);
                    }
                });
            $('#userInput').val('');
        }

        // Handle file upload
        $('#uploadForm').on('submit', function(event) {
            event.preventDefault();
            const fileInput = $('#pdfInput')[0];
            if (fileInput.files.length === 0) {
                alert('Please select a file.');
                return;
            }
            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append('file', file);

            $.ajax({
                url: '/upload',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    alert(response.success || response.error);
                    if (response.success) {
                        const documentListItem = $('<li class="list-group-item"></li>').text(`Uploaded: ${file.name}`);
                        $('#documentList').append(documentListItem);
                    }
                },
                error: function(response) {
                    alert('Error uploading file');
                }
            });
        });