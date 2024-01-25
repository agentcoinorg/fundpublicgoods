import requests

from fund_public_goods.gitcoin.models import RoundInfo, ApplicationInfo

def fetch_json_from_ipfs(pointer: str) -> dict:
    ipfs_url = f"https://ipfs.io/ipfs/{pointer}"
    response = requests.get(ipfs_url)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to fetch data from IPFS for pointer {pointer} with status code: {response.status_code}")

def fetch_rounds(url: str, skip: int, first: int) -> list[RoundInfo]:
    data = {
        "query": """
            query GetRounds($first: Int, $skip: Int) {
                rounds(
                    first: $first
                    skip: $skip
                ) {
                    id
                }
            }
        """,
        "variables": {
            "first": first,
            "skip": skip
        }
    }

    response = requests.post(url, json=data)

    if response.status_code == 200:
        rounds = response.json()['data']['rounds']

        return [RoundInfo(id=round['id']) for round in rounds]
    else:
        raise Exception(f"Request failed with status code: {response.status_code}")

def fetch_project_applications(url: str, round_id: str, skip: int, first: int) -> list[ApplicationInfo]:
    data = {
        "query": """
            query GetRoundById($roundId: String, $first: Int, $skip: Int) {
                round(
                    id: $roundId
                ) {
                    projects(
                        first: $first
                        skip: $skip
                    ) {
                        id
                        metaPtr {
                            protocol
                            pointer
                        }
                    }
                }
            }
        """,
        "variables": {
            "roundId": round_id,
            "first": first,
            "skip": skip
        }
    }

    print(f"Fetching projects for round {round_id} ...")

    response = requests.post(url, json=data)

    if response.status_code == 200:
        json = response.json()

        if "errors" in json:
            raise Exception(f"Request failed with errors: {json['errors']}")
        
        projects = json['data']['round']['projects']

        apps = [
            ApplicationInfo(
                id = project["id"], 
                protocol = project['metaPtr']['protocol'], 
                pointer = project['metaPtr']['pointer'],
                round_id = round_id,
            ) 
            for project in projects
        ]

        return apps
    else:
        raise Exception(f"Request failed with status code: {response.status_code}")
