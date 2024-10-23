from flask import Flask, request, jsonify
from pymongo import MongoClient
from langchain.chat_models import ChatOpenAI
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from flask_cors import CORS
import os
import requests
import logging
from bson import ObjectId

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Enable CORS for all domains on all routes
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# MongoDB configuration
client = MongoClient(os.getenv("MONGO_URI"))
db = client['test']
courses_collection = db['courses']

# Initialize OpenAI model with API key
llm = ChatOpenAI(openai_api_key=os.getenv("OPENAI_API_KEY"))

# Function to get text from a PDF
def get_pdf_text(pdf_url):
    logging.debug(f"Fetching PDF from URL: {pdf_url}")
    response = requests.get(pdf_url)  # Fetch the PDF from the URL
    if response.status_code == 200:
        with open("temp.pdf", "wb") as f:
            f.write(response.content)
        text = ""
        with open("temp.pdf", "rb") as file:
            reader = PdfReader(file)
            for page in reader.pages:
                text += page.extract_text()
        logging.debug("PDF text extracted successfully.")
        return text
    else:
        logging.error(f"Failed to fetch PDF, status code: {response.status_code}")
        return ""

# Function to generate questions with multiple choice answers using GPT
def generate_questions_from_gpt(text, num_questions=10):
    logging.debug("Generating questions using GPT.")
    
    prompt = f"Please generate {num_questions} meaningful multiple choice questions based on the following content:\n\n{text}\n\nEach question should be structured as: 'Question? | Correct Answer | Option A | Option B | Option C'."
    
    # Create the messages list for the chat model
    messages = [{"role": "user", "content": prompt}]
    
    try:
        # Call the OpenAI model to generate questions
        response = llm(messages)
        logging.debug(f"Raw response from GPT: {response}")
        
        questions = []
        
        # Process the response to extract questions
        for line in response['choices'][0]['message']['content'].strip().split('\n'):
            if line:
                question_data = line.split(' | ')
                if len(question_data) >= 4:
                    questions.append({
                        "question": question_data[0].strip(),
                        "answer": question_data[1].strip(),
                        "options": [option.strip() for option in question_data[2:]]
                    })
                else:
                    logging.warning(f"Unexpected format for question line: {line}")

        logging.debug(f"Generated {len(questions)} questions using GPT.")
        return questions
    
    except Exception as e:
        logging.error(f"Error while generating questions: {str(e)}")
        return []

# Route to generate a quiz based on a course PDF
@app.route('/quiz/<course_id>', methods=['GET'])
def get_quiz(course_id):
    logging.debug(f"Requesting quiz for course ID: {course_id}")
    
    course = courses_collection.find_one({"_id": ObjectId(course_id)})
    if not course:
        logging.error("Course not found.")
        return jsonify({"error": "Course not found"}), 404

    pdf_url = course.get("pdfUrl")
    logging.debug(f"PDF URL retrieved: {pdf_url}")

    if pdf_url:
        text = get_pdf_text(pdf_url)
        if text:
            questions = generate_questions_from_gpt(text)
            logging.debug(f"Generated Questions: {questions}")  # Log generated questions
            return jsonify({"questions": questions}), 200
        else:
            logging.error("Failed to process the PDF.")
            return jsonify({"error": "Failed to process the PDF"}), 500
    else:
        logging.error("No PDF found for this course.")
        return jsonify({"error": "No PDF found for this course"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5002)
