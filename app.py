from flask import Flask, send_from_directory
from flask_restful import Api, Resource, reqparse
#from flask_cors import CORS #comment this on deployment
from api.HelloApiHandler import HelloApiHandler
from flask import request, jsonify
from flask_cors import CORS, cross_origin
import openai
from dotenv import load_dotenv
from resume import run, insert_data, pdf_reader
import os
import mysql.connector

load_dotenv()
app = Flask(__name__)
CORS(app, origins='http://localhost:5173')
api_key = os.environ['OPENAI_API_KEY']
result = ""
@app.route("/flask/hello")
def hello():
    return "My Data from Flask API"

@app.route("/") #comment this on deployment
def helloReact():
    return send_from_directory('frontend/dist','index.html')

""" @app.route('/translate-query-result', methods=['POST'])
@cross_origin()
def translate_query_result():
    #result = request.json['result']
    result = request.json['result'] """


@app.route('/orders')
def get_orders():
    # Establish a new connection
    connection = mysql.connector.connect(
        host="sql12.freesqldatabase.com",
        database="sql12627423",
        user="sql12627423",
        password="zuCQXPmvx4",
        port=3306
    )

    cursor = connection.cursor()
    cursor.execute("SELECT * FROM user_data")
    results = cursor.fetchall()

    orders = []
    for result in results:
        order = {
            'ID': result[0],
            'Name': result[1],
            'Email_ID': result[2],
            'Phone_No': result[3],
            'Timestamp': result[4],
            'Predicted_Field': result[5],
            'Actual_skills': result[6],
            'Degree': result[7]
        }
        orders.append(order)
    cursor.close()
    connection.close()

    return jsonify(orders)

@app.route('/translate-query-result', methods=['POST'])
@cross_origin()
def get_tables():
    # Establish a new connection
    data = request.get_json()  # Get the JSON payload from the request
    query = data['result']  # Access the 'result' variable
    connection = mysql.connector.connect(
        host="sql12.freesqldatabase.com",
        database="sql12627423",
        user="sql12627423",
        password="zuCQXPmvx4",
        port=3306
    )
    if query:
        cursor = connection.cursor()  # Extract the query string from the dictionary
        sql_query = f"SELECT " + query  # Concatenate the query variable with the SQL statement
        cursor.execute(sql_query)
        results = cursor.fetchall()

        orders = []
        for result in results:
            order = {
                'ID': result[0],
                'Name': result[1],
                'Email_ID': result[2],
                'Phone_No': result[3],
                'Timestamp': result[4],
                'Predicted_Field': result[5],
                'Actual_skills': result[6],
                'Degree': result[7]
            }
            orders.append(order)

        cursor.close()
        connection.close()
        return jsonify(orders)


@app.route('/translate-query', methods=['POST'])
@cross_origin()
def translate_query():
    prompt = request.json['query']
    
    openai.api_key = api_key
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=f"You are a sql query generator. so when i give you a prompt, you will generate a sql query. \nFor example, if I give you the prompt 'all data from users', you will generate the sql query 'select * from users' \ne.g., prompt: 'top 3 users by age' -> query:'select top 3 * from users order by age desc' \nprompt: 'give me the students with the highest gpa' -> query:'select * from students order by gpa desc limit 1'\n### MY SQL table, with their properties:\n#\n# user_data(ID, Email_ID, Phone_No, Timestamp, Predicted_Field, Actual_skills, Degree)\n#\n### Here is my Prompt: {prompt}\nSELECT",
        max_tokens=200,
    )
    """ response = openai.Completion.create(
        model="gpt-3.5-turbo",
        prompt=f"You are a sql query generator. so when i give you a prompt, you will generate a sql query. \nFor example, if I give you the prompt 'all data from users', you will generate the sql query 'select * from users' \ne.g., prompt: 'top 3 users by age' -> query:'select top 3 * from users order by age desc' \nprompt: 'give me the students with the highest gpa' -> query:'select * from students order by gpa desc limit 1'\n### MY SQL table, with their properties:\n#\n# user_data(ID, Email_ID, Timestamp, Page_no, Predicted_Field, Actual_skills)\n#\n### Here is my Prompt: {prompt}\nSELECT"
        ) """
    
    # prompt= "### MY SQL table, with their properties:\n#\n# user_data(ID, Email_ID, Timestamp, Page_no, Predicted_Field, Actual_skills)\n#\n### Here is my Prompt: {prompt}\nSELECT"
    result = response.choices[0].text.strip()
    print(result)
    return jsonify({'result': result})


""" response = openai.Completion.create(
        model="gpt-3.5-turbo",
        messages=[
        {
            "role": "system",
            "content": "You are a sql query generator. when i give you a prompt, you will generate a sql query. \nFor example, if I give you the prompt 'all data from users', you will generate the sql query 'select * from users' \ne.g., prompt: 'top 3 users by age' -> query:'select top 3 * from users order by age desc' \nprompt: 'give me the students with the highest gpa' -> query:'select * from students order by gpa desc limit 1'\n### MY SQL table, with their properties:\n#\n# user_data(ID, Email_ID, Timestamp, Page_no, Predicted_Field, Actual_skills)\n#\n### Here is my Prompt: {prompt}\nSELECT"
        },
        {
            "role": "user",
            "content": "Generate an sql query for the following prompt \n\n```{prompt}```"
        }
        ],
        ) """

@app.route('/translate-pdf', methods=['POST'])
@cross_origin()
def translate_query_with_pdf():
    pdf_file = request.files['pdfFile']
    #pdf_file.save(pdf_file.filename)
    run_result = run(pdf_file)
    print(run_result)
    print(result)
    return jsonify({
        'pdf': run_result
        })


""" app = Flask(__name__, static_url_path='', static_folder='frontend/dist')
#CORS(app) #comment this on deployment
api = Api(app) """

""" @app.route("/", defaults={'path':''})
def serve(path):
    return send_from_directory(app.static_folder,'index.html') """


# api.add_resource(HelloApiHandler, '/flask/hello')

if __name__ == '__main__':
   app.run(debug=True)