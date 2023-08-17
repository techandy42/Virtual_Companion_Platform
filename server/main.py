from flask import Flask, request, jsonify
from flask_cors import CORS # Import CORS
import openai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app) # Apply CORS to the app

# Configure OpenAI API Key
openai_api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = openai_api_key

@app.route('/create-image', methods=['POST'])
def create_image():
    # Get name and description from the request
    name = request.json.get('name')
    description = request.json.get('description')

    # Summarize the description using GPT-4
    summary_response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=f"Summarize the following description into a creative brief for an image. Summary should be no more than 10 words.: {description}",
        max_tokens=50
    )
    summary = summary_response.choices[0].text

    print(summary)

    # Call DALL-E API to generate an image (Note: Replace this with an actual call to DALL-E)
    response = openai.Image.create(
      prompt=summary,
      n=1,
      size='256x256'
    )
    image_url = response['data'][0]['url']

    print(image_url)

    return jsonify({"message": "Image created successfully", "path": image_url})

if __name__ == '__main__':
    app.run(debug=True)
