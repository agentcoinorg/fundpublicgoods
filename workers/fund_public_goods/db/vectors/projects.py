from fund_public_goods.db.vec_db import create

def upsert(
    id: str,
    title: str,
    description: str,
    website: str
):
    client = create()

    # TODO:
    # generate embeddings for (title, description(chunks), website)
    # upload to (indexes OR namespaces?)
        # id = projectid/chunk_{...}

    index.upsert(
        vectors=[
            {"id": id, "values": vecs},
        ],
        namespace="projects"
    )

    # NEED:
    # - only search by description|title|website
    # WANT:
    # - remove unneeded words from description


projects_index.query(
  namespace="title",
  vector=[query],
  top_k=10,
  include_values=True
)

projects_index.query(
  namespace="title",
  vector=[query],
  top_k=10,
  include_values=True
)

# Returns:
# {'matches': [{'id': 'vec3',
#               'score': 0.0,
#               'values': [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3]},
#              {'id': 'vec4',
#               'score': 0.0799999237,
#               'values': [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4]},
#              {'id': 'vec2',
#               'score': 0.0800000429,
#               'values': [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2]}],
#  'namespace': 'ns1',
#  'usage': {'read_units': 6}}

