from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import networkx as nx

router = APIRouter()

# What the frontend sends us
class RouteRequest(BaseModel):
    start_node: str = "Zone_A"
    end_node: str = "Shelter_1"
    blocked_roads: list[str] = []

@router.post("/optimize")
def optimize_route(req: RouteRequest):
    """
    Module 2: Rescue Route Planner.
    Uses Dijkstra's algorithm to find the fastest path avoiding disaster zones.
    """
    # 1. Build the Gorakhpur Demo Graph
    G = nx.Graph()
    
    # Add Roads (Start, End, Distance/Weight, Road Name)
    G.add_edge("Zone_A", "Intersection_1", weight=5, name="Main St")
    G.add_edge("Intersection_1", "Shelter_1", weight=10, name="Highway 1")  # Fast route
    G.add_edge("Zone_A", "Shelter_1", weight=25, name="Backroad")           # Slow alternative
    
    # 2. Simulate Road Blockages (Flood/Damage)
    edges_to_remove = []
    for u, v, data in G.edges(data=True):
        if data["name"] in req.blocked_roads:
            edges_to_remove.append((u, v))
            
    G.remove_edges_from(edges_to_remove)
    
    # 3. Calculate the Shortest Path
    try:
        path = nx.shortest_path(G, source=req.start_node, target=req.end_node, weight="weight")
        return {
            "status": "success",
            "feasible_route": path
        }
    except nx.NetworkXNoPath:
        # If "Highway 1" and "Backroad" are both blocked, it fails safely!
        raise HTTPException(
            status_code=400, 
            detail="⚠️ No feasible route exists. All paths blocked by disaster!"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))