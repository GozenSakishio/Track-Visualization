import pandas as pd
import sys

if __name__ == "__main__":
	data = pd.read_csv("../data/track_with_head.csv")
	#unique_ids = sorted(list(data.id.unique()))
	unique_ids = sorted(list(data.id.unique()))[:100]
	#unique_times = sorted(list(data.time.unique()))
	unique_times = sorted(list(data.time.unique()))[:100]
	print("Processing person")
	for i in range(len(unique_ids)):
		person_id = unique_ids[i]
		df = pd.DataFrame(columns=('time', 'id',
			'x', 'y', 'z', 'velocity', 'angle of motion', 'facing angle'))
		perData = data.loc[data["id"] == person_id]
		perData.to_csv("person/{}.csv".format(i))
		sys.stdout.write("\rhandle person {}/{}".format(i + 1, len(unique_ids)))
		if i < len(unique_ids) - 1:
			sys.stdout.flush()
	print("\nProcessing time")
	for i in range(len(unique_times)):
		time = unique_times[i]
		df = pd.DataFrame(columns=('time', 'id',
			'x', 'y', 'z', 'velocity', 'angle of motion', 'facing angle'))
		perData = data.loc[data["time"] == time]
		perData.to_csv("time/{}.csv".format(i))
		sys.stdout.write("\rhandle time {}/{}".format(i +  1, len(unique_times)))
		sys.stdout.flush()
