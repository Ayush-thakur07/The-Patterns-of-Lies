import os
import sys

# When ADK runs this as a standalone package (adk web npc_agents/<name>),
# it adds npc_agents/ to sys.path. We walk two levels up to reach the
# project root so npc_agents.case_dai_006.* is importable as an absolute path.
_project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from npc_agents.case_dai_006.victor_voss import victor_voss_agent

root_agent = victor_voss_agent
