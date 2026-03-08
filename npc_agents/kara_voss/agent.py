import os
import sys

_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from npc_agents.case_dai_007.kara_voss import kara_voss_agent

root_agent = kara_voss_agent
