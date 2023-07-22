#import streamlit as st
import nltk
import spacy
nltk.download('stopwords')
spacy.load('en_core_web_sm')
from dotenv import load_dotenv
import os

#import pandas as pd
import base64, random
import time, datetime
from pyresparser import ResumeParser
from pdfminer3.layout import LAParams, LTTextBox
from pdfminer3.pdfpage import PDFPage
from pdfminer3.pdfinterp import PDFResourceManager
from pdfminer3.pdfinterp import PDFPageInterpreter
from pdfminer3.converter import TextConverter
import io, random
#from streamlit_tags import st_tags
#from PIL import Image
import pymysql
#import mysql.connector
# from Courses import ds_course, web_course, android_course, ios_course, uiux_course, resume_videos, interview_videos
#import pafy
#import plotly.express as px

""" def fetch_yt_video(link):
    video = pafy.new(link)
    return video.title """

load_dotenv()
SQL_HOST = os.environ['SQL_HOST']
SQL_USER = os.environ['SQL_USER']
SQL_PASSWORD = os.environ['SQL_PASSWORD']
SQL_DATABASE = os.environ['SQL_DATABASE']

def get_table_download_link(df, filename, text):
    """Generates a link allowing the data in a given panda dataframe to be downloaded
    in:  dataframe
    out: href string
    """
    csv = df.to_csv(index=False)
    b64 = base64.b64encode(csv.encode()).decode()  # some strings <-> bytes conversions necessary here
    # href = f'<a href="data:file/csv;base64,{b64}">Download Report</a>'
    href = f'<a href="data:file/csv;base64,{b64}" download="{filename}">{text}</a>'
    return href


def pdf_reader(file):
    resource_manager = PDFResourceManager()
    fake_file_handle = io.StringIO()
    converter = TextConverter(resource_manager, fake_file_handle, laparams=LAParams())
    page_interpreter = PDFPageInterpreter(resource_manager, converter)
    with open(file, 'rb') as fh:
        for page in PDFPage.get_pages(fh,
                                      caching=True,
                                      check_extractable=True):
            page_interpreter.process_page(page)
            print(page)
        text = fake_file_handle.getvalue()

    # close open handles
    converter.close()
    fake_file_handle.close()
    return text

""" connection = mysql.connector.connect(
    user=SQL_USER,
    password=SQL_PASSWORD,
    host=SQL_HOST,
    database=SQL_DATABASE,
    port=3306
) """
def insert_data(name, email, phone, timestamp, reco_field, skills, degree):
    DB_table_name = 'user_data'
    insert_sql = "insert into " + DB_table_name + """
    values (0,%s,%s,%s,%s,%s,%s,%s)"""
    rec_values = (name, email, phone, timestamp, reco_field, skills, degree)
    connection = pymysql.connect(host=SQL_HOST, user=SQL_USER, password=SQL_PASSWORD, database=SQL_DATABASE, port=3306)
    cursor = connection.cursor()
    cursor.execute(insert_sql, rec_values)
    connection.commit()
    cursor.close()
    connection.close()

def run(pdf_file):
    # Connect to the database
    connection = pymysql.connect(host=SQL_HOST, user=SQL_USER, password=SQL_PASSWORD, database=SQL_DATABASE, port=3306)
    cursor = connection.cursor()
    connection.select_db(SQL_DATABASE)

    # Create table
    DB_table_name = 'user_data'
    table_sql = "CREATE TABLE IF NOT EXISTS " + DB_table_name + """
                    (ID INT NOT NULL AUTO_INCREMENT,
                     Name varchar(100),
                     Email_ID VARCHAR(50),
                     Phone_No VARCHAR(50),
                     Timestamp VARCHAR(50) NOT NULL,
                     Predicted_Field VARCHAR(50) NOT NULL,
                     Actual_skills VARCHAR(300) NOT NULL,
                     Degree VARCHAR(100),
                     PRIMARY KEY (ID));
                    """
    cursor.execute(table_sql)
    # st.markdown('''<h4 style='text-align: left; color: #d73b5c;'>* Upload your resume, and get smart recommendation based on it."</h4>''',
    #             unsafe_allow_html=True)
    #pdf_file = st.file_uploader("Choose your Resume", type=["pdf"])
    if pdf_file is not None:
        # with st.spinner('Uploading your Resume....'):
        #     time.sleep(4)
        save_image_path = './Uploaded_Resumes/' + pdf_file.filename + str(random.randint(1, 100000)) + '.pdf'
        pdf_file.save(save_image_path)  # Save the file
        resume_data = ResumeParser(save_image_path).get_extracted_data()
        if resume_data:
            ## Get the whole resume data
            resume_text = pdf_reader(save_image_path)
            ## Skill shows
            """ keywords = st_tags(label='### Skills that you have',
                               text='See our skills recommendation',
                               value=resume_data['skills'], key='1') """
            ##  recommendation
            ds_keyword = ['tensorflow', 'keras', 'pytorch', 'machine learning', 'deep Learning', 'flask',
                          'streamlit']
            web_keyword = ['react', 'django', 'node jS', 'react js', 'php', 'laravel', 'magento', 'wordpress',
                           'javascript', 'angular js', 'c#', 'flask']
            android_keyword = ['android', 'android development', 'flutter', 'kotlin', 'xml', 'kivy']
            ios_keyword = ['ios', 'ios development', 'swift', 'cocoa', 'cocoa touch', 'xcode']
            uiux_keyword = ['ux', 'adobe xd', 'figma', 'zeplin', 'balsamiq', 'ui', 'prototyping', 'wireframes',
                            'storyframes', 'adobe photoshop', 'photoshop', 'editing', 'adobe illustrator',
                            'illustrator', 'adobe after effects', 'after effects', 'adobe premier pro',
                            'premier pro', 'adobe indesign', 'indesign', 'wireframe', 'solid', 'grasp',
                            'user research', 'user experience']
            recommended_skills = []
            reco_field = ''
            rec_course = ''
            ## Courses recommendation
            for i in resume_data['skills']:
                ## Data science recommendation
                if i.lower() in ds_keyword:
                    print(i.lower())
                    reco_field = 'Data Science'
                    break
                ## Web development recommendation
                elif i.lower() in web_keyword:
                    print(i.lower())
                    reco_field = 'Web Development'
                    break
                ## Android App Development
                elif i.lower() in android_keyword:
                    print(i.lower())
                    reco_field = 'Android Development'
                    break
                ## IOS App Development
                elif i.lower() in ios_keyword:
                    print(i.lower())
                    reco_field = 'IOS Development'
                    break
                ## Ui-UX Recommendation
                elif i.lower() in uiux_keyword:
                    print(i.lower())
                    reco_field = 'UI-UX Development'
                    break
            #
            ## Insert into table
            ts = time.time()
            cur_date = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d')
            #cur_time = datetime.datetime.fromtimestamp(ts).strftime('%H:%M:%S')
            timestamp = str(cur_date)
            
            print(resume_data['degree'])
            print(resume_data['mobile_number'])
            print(resume_data['total_experience'])
            print(resume_data['college_name'])
            insert_data(resume_data['name'], resume_data['email'], str(resume_data['mobile_number']), timestamp,
                        reco_field, str(resume_data['skills']), str(resume_data['degree']))
            connection.commit()
            os.remove(save_image_path)
            cursor.close()
            connection.close()
            return 'Success'
        else:
            return 'Failed'

    ##TODO Admin Side
    """ st.success('Welcome to Admin Side')
    # st.sidebar.subheader('**ID / Password Required!**')
    ad_user = st.text_input("Username")
    ad_password = st.text_input("Password", type='password')
    if st.button('Login'):
        if ad_user == 'machine_learning_hub' and ad_password == 'mlhub123':
            st.success("Welcome Kushal")
            # Display Data
            cursor.execute('''SELECT*FROM user_data''')
            data = cursor.fetchall()
            st.header("**User's👨‍💻 Data**")
            df = pd.DataFrame(data, columns=['ID', 'Name', 'Email', 'Resume Score', 'Timestamp', 'Total Page',
                                             'Predicted Field', 'User Level', 'Actual Skills', 'Recommended Skills',
                                             'Recommended Course'])
            st.dataframe(df)
            st.markdown(get_table_download_link(df, 'User_Data.csv', 'Download Report'), unsafe_allow_html=True)
            ## Admin Side Data
            query = 'select * from user_data;'
            plot_data = pd.read_sql(query, connection)
            ## Pie chart for predicted field recommendations
            labels = plot_data.Predicted_Field.unique()
            print(labels)
            values = plot_data.Predicted_Field.value_counts()
            print(values)
            st.subheader("📈 **Pie-Chart for Predicted Field Recommendations**")
            fig = px.pie(df, values=values, names=labels, title='Predicted Field according to the Skills')
            st.plotly_chart(fig)
            ### Pie chart for User's👨‍💻 Experienced Level
            labels = plot_data.User_level.unique()
            values = plot_data.User_level.value_counts()
            st.subheader("📈 ** Pie-Chart for User's👨‍💻 Experienced Level**")
            fig = px.pie(df, values=values, names=labels, title="Pie-Chart📈 for User's👨‍💻 Experienced Level")
            st.plotly_chart(fig)
        else:
            st.error("Wrong ID & Password Provided") """
