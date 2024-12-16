from flask import Flask, render_template, request
from flask import redirect
from flask import jsonify
import json



from flaskext.mysql import MySQL

app = Flask(__name__)

mysql = MySQL()


app.config['MYSQL_DATABASE_HOST'] 	  = 'localhost'
app.config['MYSQL_DATABASE_PORT'] 	  = 3306
app.config['MYSQL_DATABASE_USER'] 	  = 'manel'
app.config['MYSQL_DATABASE_PASSWORD'] = 'manel'
app.config['MYSQL_DATABASE_DB'] 	  = 'db_university'


mysql.init_app(app)


app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/growth_per_year')
def growth_per_year():
    conn = mysql.connect()
    cursor = conn.cursor()
    cursor.execute("SELECT annee, COUNT(*) as student_count FROM resultats GROUP BY annee")
    data = cursor.fetchall()
    cursor.close()
    return jsonify(data)

@app.route('/api/students_per_specialty_evolution')
def students_per_specialty_evolution():
    conn = mysql.connect()
    cursor = conn.cursor()
    cursor.execute("SELECT annee, specialite, COUNT(*) as student_count FROM resultats GROUP BY annee, specialite")
    data = cursor.fetchall()
    cursor.close()
    return jsonify(data)

@app.route('/api/success_trend_per_year')
def success_trend_per_year():
    conn = mysql.connect()
    cursor = conn.cursor()
    cursor.execute("SELECT annee, COUNT(*) as total_students, SUM(CASE WHEN moyenne >= 10 THEN 1 ELSE 0 END) as passed_students FROM resultats GROUP BY annee")
    data = cursor.fetchall()

    row_headers=[x[0] for x in cursor.description]

    cursor.close()

    json_data=[]
    for result in data:
        json_data.append(dict(zip(row_headers,result)))					
                        
    return jsonify(json_data)

@app.route('/api/average_distribution_per_specialty')
def average_distribution_per_specialty():
    conn = mysql.connect()
    cursor = conn.cursor()
    cursor.execute("SELECT specialite, AVG(moyenne) as average FROM resultats GROUP BY specialite")
    data = cursor.fetchall()
    cursor.close()
    return jsonify(data)

@app.route('/api/students_by_grade_range')
def students_by_grade_range():
    conn = mysql.connect()
    cursor = conn.cursor()
    cursor.execute("SELECT CASE \
                        WHEN moyenne < 10 THEN '0-10' \
                        WHEN moyenne >= 10 AND moyenne < 12 THEN '10-12' \
                        WHEN moyenne >= 12 AND moyenne < 14 THEN '12-14' \
                        ELSE '14+' \
                    END as grade_range, COUNT(*) as student_count FROM resultats GROUP BY grade_range")
    data = cursor.fetchall()
    cursor.close()
    return jsonify(data)


@app.route('/api/students_by_specialty_and_sex')
def students_by_specialty_and_sex():
    conn = mysql.connect()
    cursor = conn.cursor()
    cursor.execute("SELECT specialite, sexe, COUNT(*) as student_count FROM resultats GROUP BY specialite, sexe")
    data = cursor.fetchall()
    cursor.close()
    return jsonify(data)

@app.route('/api/performance_by_gender_and_specialty')
def performance_by_gender_and_specialty():
    conn = mysql.connect()
    cursor = conn.cursor()
    cursor.execute("SELECT annee, specialite, sexe, ROUND(AVG(moyenne), 1) as avg_performance FROM resultats GROUP BY annee, specialite, sexe")
    data = cursor.fetchall()
    cursor.close()
    return jsonify(data)

@app.route('/api/average_distribution_per_specialty_by_year')
def average_distribution_per_specialty_by_year():
    conn = mysql.connect()
    cursor = conn.cursor()
    cursor.execute("SELECT annee, specialite, ROUND(AVG(moyenne), 1)  as average FROM resultats GROUP BY annee, specialite")
    data = cursor.fetchall()
    cursor.close()
    return jsonify(data)

	
if __name__ == "__main__" : 
    app.run(debug=True,port=5000)
	
	
	