from flask import Flask, request, jsonify
from pymongo import MongoClient
from langchain.chat_models import ChatOpenAI
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import ConversationalRetrievalChain
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from flask_cors import CORS
import os
import requests  # <-- Make sure 'requests' is imported
from bson import ObjectId

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Enable CORS for all domains on all routes
CORS(app)

# MongoDB configuration
client = MongoClient(os.getenv("MONGO_URI"))
db = client['test']
courses_collection = db['courses']

# Initialize OpenAI model with API key
llm = ChatOpenAI(openai_api_key=os.getenv("OPENAI_API_KEY"))

# Initialize OpenAI embeddings
embeddings = OpenAIEmbeddings()

# Path to save FAISS index
faiss_index_path = "faiss_index"

# Function to get text from a PDF
def get_pdf_text(pdf_url):
    response = requests.get(pdf_url)  # Fetch the PDF from the URL
    if response.status_code == 200:
        with open("temp.pdf", "wb") as f:
            f.write(response.content)
        text = ""
        with open("temp.pdf", "rb") as file:
            reader = PdfReader(file)
            for page in reader.pages:
                text += page.extract_text()
        return text
    else:
        return ""

# Function to split text into smaller chunks
def get_text_chunks(text):
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    return text_splitter.split_text(text)

# Function to process PDF and create a vectorstore
def process_pdf_and_create_vectorstore(pdf_url):
    text = get_pdf_text(pdf_url)
    if text:
        text_chunks = get_text_chunks(text)
        metadatas = [{"source": "course_pdf"}] * len(text_chunks)
        vectorstore = FAISS.from_texts(text_chunks, embeddings, metadatas)
        vectorstore.save_local(faiss_index_path)
        return vectorstore
    else:
        return None

# Function to get the conversation chain
def get_conversation_chain(vectorstore):
    return ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever()
    )

# Route for the chatbot to answer questions based on a course's PDF
@app.route('/chat/<course_id>', methods=['POST'])
def chat_with_course_pdf(course_id):
    data = request.json
    question = data.get('question')
    
    # Log question received
    print(f"Received question: {question}")

    # Retrieve the specific course from MongoDB
    course = courses_collection.find_one({"_id": ObjectId(course_id)})
    if not course:
        return jsonify({"error": "Course not found"}), 404

    pdf_url = course.get("pdfUrl")

    # If the PDF is available, process it and create vectorstore
    if pdf_url:
        vectorstore = process_pdf_and_create_vectorstore(pdf_url)
        if vectorstore:
            conversation_chain = get_conversation_chain(vectorstore)

            # Generate a response to the question with empty chat history
            response = conversation_chain({"question": question, "chat_history": []})

            # Log response generation success and the response itself
            print(f"Generated response successfully: {response['answer']}")

            # Return the response
            return jsonify({"response": response['answer']})
        else:
            return jsonify({"error": "Failed to process the PDF"}), 500
    else:
        return jsonify({"error": "No PDF found for this course"}), 404

if __name__ == '__main__':
    app.run(debug=True)
