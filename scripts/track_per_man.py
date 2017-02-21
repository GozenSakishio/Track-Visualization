import mysql.connector
from mysql.connector import Error
from mysql.connector import errorcode
import pandas as pd
import sys


def connectDB():
	""" Connect to track Database """
	try:
		conn = mysql.connector.connect(host='localhost',
									   database='track',
									   user='root',
									   password='')
		if conn.is_connected():
			print("Database load success!")
			return conn
	except Error as e:
		print(e)
		return None

def initDatabase(conn, dataSrc):
	"""CREATE tale and insert values"""
	TABLES = {}
	TABLES['store_track'] = (
    " CREATE TABLE store_track ("
    "  id int(10) NOT NULL,"
    "  time double NOT NULL,"
    "  pid int(10) NOT NULL,"
    "  x int(6) NOT NULL,"
    "  y int(6) NOT NULL,"
    "  z float NOT NULL,"
    "  velocity float NOT NULL,"
    "  motion float NOT NULL,"
    "  facing float NOT NULL,"
    "  PRIMARY KEY (id));")
	cursor = conn.cursor()
	try:
		cursor.execute(TABLES['store_track'])
	except Error as err:
		if err.errno == errorcode.ER_TABLE_EXISTS_ERROR:
			print("Table already exists.")
		else:
			print(err.msg)
	print("Create table done.")
	print("Reading raw data..")
	rawData = pd.read_csv(dataSrc)
	print("Raw data read done.")
	print("Insert raw data..")
	for i in range(rawData.shape[0]):
		if i % 10 == 0:
			sys.stdout.write("\r{}/{}".format(i, rawData.shape[0]))
			sys.stdout.flush()
		tmp = rawData[i:i + 1].values.tolist()[0]
		query = '''INSERT INTO store_track 
    	(id, time, pid, x, y, z, velocity, motion, facing) 
    	VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s)'''
		try:
			cursor.execute(query, (i, float(tmp[0]), int(tmp[1]), int(tmp[2]), int(tmp[3]), tmp[4], tmp[5], tmp[6], tmp[7]))
		except Error as err:
			print(err.msg)
	print("")
	print("Insert init values done.")
	conn.commit()
	cursor.close()


def buildOnDatabase(conn, personId):
	""" Build person's track data from database """
	print("Generate {}(id) person's track from database".format(personId))
	query = "SELECT * FROM store_track WHERE pid = %s"
	cursor = conn.cursor()
	ans = None
	try:
		cursor.execute(query, (personId,))
		ans = cursor.fetchall()
		# print(ans[0])
	except Error as e:
		print(e)
	if ans:
		df = pd.DataFrame(columns=('time', 'id',
			'x', 'y', 'z', 'velocity', 'angle of motion', 'facing angle'))
		print("This person has a track sized {}".format(len(ans)))
		for i in range(len(ans)):
			df.loc[i] = list(ans[i][1:])
		df.to_csv("{}_track.csv".format(personId))
		print("Track generate success!")


def buildOnSource(dataSrc, personId):
	""" Build person's track data from source data """
	print("Generate {}(id) person's track from source data".format(personId))
	data = pd.read_csv(dataSrc)
	perData = data.loc[data["id"] == personId]
	print("This person has a track sized {}".format(perData.shape[0]))
	perData.to_csv("{}_track.csv".format(personId))
	print("Track generate success!")


if __name__ == "__main__":
	# Command line: python xxx.py xxx.csv id
	if len(sys.argv) == 4 and sys.argv[3] == '-s':
		buildOnSource(sys.argv[1], int(sys.argv[2]))
	elif len(sys.argv) == 3:
		print("Load Database")
		conn = connectDB()
		if conn:
			initDatabase(conn, sys.argv[1])
			buildOnDatabase(conn, int(sys.argv[2]))
			conn.close()
		else:
			buildOnSource(sys.argv[1], int(sys.argv[2]))
	# Command line: python xxx.py id
	elif len(sys.argv) == 2:
		conn = connectDB()
		if conn:
			buildOnDatabase(conn, int(sys.argv[1]))
			conn.close()
		else:
			print("Connect database failed. Choose generate from source")
	else:
		print("Please enter a person's id. Eg: 9315400")

