import pymongo
import pprint
import pandas as pd
    
client = pymongo.MongoClient("mongodb://localhost:27011")
db = client["Ind"] # Ind is the database name and our db is the whole database which has collections and all.

users = []
expenses = []
firebases = []
tokens = []
extracteds = []
categories = []

for coll in db.list_collection_names(): # this will give us the collections name present in the database
    collection = db[coll] 
    cursor = collection.find({}) # to get what present inside the collection
    for document in cursor:
        if coll == "users":
            users.append(document)
        if coll == "expenses":
            expenses.append(document)
        if coll == "firebases":
            firebases.append(document)
        if coll == "tokens":
            tokens.append(document)
        if coll == "extracteds":
            extracteds.append(document)
        if coll == "categories":
            categories.append(document)
        

user_df = pd.DataFrame(users)
user_df.to_csv("users.csv")

user_df = pd.DataFrame(expenses)
user_df.to_csv("expenses.csv")

user_df = pd.DataFrame(firebases)
user_df.to_csv("firebases.csv")

user_df = pd.DataFrame(tokens)
user_df.to_csv("tokens.csv")

user_df = pd.DataFrame(extracteds)
user_df.to_csv("extracteds.csv")

user_df = pd.DataFrame(categories)
user_df.to_csv("categories.csv")



''''''''''''''''''''''''''
# below code is to get the db name and its collecions
# import pymongo
# import json

# if __name__ == '__main__':
#     client = pymongo.MongoClient("localhost", 27011, maxPoolSize=50)
#     d = dict((db, [collection for collection in client[db].collection_names()])
#              for db in client.database_names())
#     print(json.dumps(d))
''''''''''''''''''''''''''
