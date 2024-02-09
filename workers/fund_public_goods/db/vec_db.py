from pinecone import Pinecone # type: ignore

def create() -> Pinecone:
    return Pinecone()
