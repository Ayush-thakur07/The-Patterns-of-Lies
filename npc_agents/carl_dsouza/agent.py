import os
import sys

_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from npc_agents.case_dai_007.carl_dsouza import carl_dsouza_agent

root_agent = carl_dsouza_agent
