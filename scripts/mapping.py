import pandas as pd 
import json
import sys

if __name__ == "__main__":
	data = pd.read_csv("../data/track_with_head.csv")
	unique_ids = sorted(list(data.id.unique())[:100])
	unique_times = sorted(list(data.time.unique())[:100])
	# unique_ids = sorted(list(data.id.unique()))
	# unique_times = sorted(list(data.time.unique()))
	id_map = dict(zip([str(id) for id in unique_ids],
		range(len(unique_ids))))
	times_map = dict(zip(range(len(unique_times)),
		[str(time) for time in unique_times]))
	json.dump(id_map, open("./person_id_map.json", "w"))
	json.dump(times_map, open("./time_map.json", "w"))

