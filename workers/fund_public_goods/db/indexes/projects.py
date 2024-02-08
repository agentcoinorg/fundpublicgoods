from fund_public_goods.db.vec_db import create
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter


def add_chunk_ids(id, chunks):
    vecs = []
    for i in range(len(chunks)):
        vec = chunks[i]
        vecs.append({
            "id": f"{id}/chunk_{i}",
            "values": vec
        })

def upsert(
    id: str,
    description: str
):
    vec_db = create()
    projects_index = vec_db.Index("projects")
    embeddings = OpenAIEmbeddings()

    # Chunk the description
    description_chunks = CharacterTextSplitter(
        separator="\n\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        is_separator_regex=False,
    ).split_text(description)

    # Generate embeddings for each chunk
    description_vecs = embeddings.embed_documents(
        description_chunks
    )

    # Upsert description chunks
    projects_index.upsert(
        vectors=add_chunk_ids(id, description_vecs),
        namespace= "description"
    )

"""
projects_index.query(
    namespace="description",
    vector=query_vectors,
    top_k=2
)
"""
