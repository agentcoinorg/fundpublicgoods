import chromadb

def create() -> chromadb.HttpClient:
    chromadb.HttpClient(host='localhost', port=6666)
