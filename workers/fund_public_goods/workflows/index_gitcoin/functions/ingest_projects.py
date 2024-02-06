from fund_public_goods.workflows.index_gitcoin.events.ingest_projects import IngestProjectsEvent
from typing import Set, List, Dict
from collections import defaultdict
import inngest
import validators


def is_valid_url(url: str) -> bool:
    if not (url.startswith('http://') or url.startswith('https://')):
        url = 'http://' + url
    return validators.url(url)


Graph = Dict[str, Set[str]]


def add_edge(graph: Graph, vertex_a: str, vertex_b: str) -> None:
    graph[vertex_a].add(vertex_b)
    graph[vertex_b].add(vertex_a)


def dfs(graph: Graph, start: str, visited: Set[str], component: List[str]) -> None:
    visited.add(start)
    component.append(start)
    for neighbour in graph[start]:
        if neighbour not in visited:
            dfs(graph, neighbour, visited, component)


def get_connected_components(graph: Graph) -> List[List[str]]:
    visited: Set[str] = set()
    components: List[List[str]] = []
    for vertex in graph.keys():
        if vertex not in visited:
            component: List[str] = []
            dfs(graph, vertex, visited, component)
            components.append(component)
    return components


def group_projects(data: List[tuple[str, str]]) -> List[Dict[str, List[str]]]:
    graph: Graph = defaultdict(set)
    
    for website, project_name in data:
        add_edge(graph, website, project_name)
    
    components: List[List[str]] = get_connected_components(graph)
    
    project_groups: List[Dict[str, List[str]]] = []
    for component in components:
        websites: List[str] = [node for node in component if 'com' in node]
        project_names: List[str] = [node for node in component if 'com' not in node]
        project_groups.append({'websites': websites, 'project_names': project_names})
    
    return project_groups


@inngest.create_function(
    fn_id="ingest_projects",
    trigger=IngestProjectsEvent.trigger,
)
async def ingest_projects(
    ctx: inngest.Context,
    step: inngest.Step,
) -> str | None:
    
    
    return "done"
