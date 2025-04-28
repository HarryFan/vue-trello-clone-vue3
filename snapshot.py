import os
import json
import re

SRC_DIR = "src"

def list_files(base):
    tree = []
    for root, dirs, files in os.walk(base):
        for d in dirs:
            tree.append({
                "type": "dir",
                "path": os.path.relpath(os.path.join(root, d), base)
            })
        for f in files:
            tree.append({
                "type": "file",
                "path": os.path.relpath(os.path.join(root, f), base)
            })
    return tree

def parse_jsdoc(jsdoc):
    import re
    inputs = []
    output = None
    if not jsdoc:
        return inputs, output
    param_matches = re.findall(r'@param\\s+{([^}]+)}\\s+(\\w+)(?:\\s*-\\s*([^\\n]+))?', jsdoc)
    for typ, name, desc in param_matches:
        inputs.append({'name': name, 'type': typ, 'desc': desc or ''})
    ret_match = re.search(r'@returns?\\s+{([^}]+)}\\s*([^\\n]*)', jsdoc)
    if ret_match:
        output = {'type': ret_match.group(1), 'desc': ret_match.group(2).strip()}
    return inputs, output

def list_files_with_info(base):
    tree = []
    for root, dirs, files in os.walk(base):
        for d in dirs:
            tree.append({
                "type": "dir",
                "path": os.path.relpath(os.path.join(root, d), base)
            })
        for f in files:
            rel_path = os.path.relpath(os.path.join(root, f), base)
            entry = {
                "type": "file",
                "path": rel_path
            }
            abs_path = os.path.join(base, rel_path)
            if f.endswith('.vue'):
                info = extract_vue_info(abs_path)
                # 補上 functions 的 jsdoc input/output
                for func in info.get("functions", []):
                    jsdoc = func.get("jsdoc", "")
                    inputs, output = parse_jsdoc(jsdoc)
                    func["inputs"] = inputs
                    func["output"] = output
                entry["functions"] = info.get("functions", [])
            elif f.endswith('.js'):
                info = extract_js_info(abs_path)
                for func in info.get("functions", []):
                    jsdoc = func.get("jsdoc", "")
                    inputs, output = parse_jsdoc(jsdoc)
                    func["inputs"] = inputs
                    func["output"] = output
                entry["functions"] = info.get("functions", [])
            tree.append(entry)
    return tree

def extract_jsdoc(content, func_name):
    """
    從 JS/Vue 檔案內容中，根據函式名稱擷取 JSDoc 註解
    @param content: 檔案全文字串
    @param func_name: 函式名稱
    @return: JSDoc 註解字串，若無則為空字串
    """
    # 支援 /** ... */ 或 // ... 單行註解
    # 只抓緊鄰在 function 前的註解
    pattern = re.compile(r"(/\*\*.*?\*/|//.*?\n)\s*function\s+" + re.escape(func_name) + r"\(", re.DOTALL)
    match = pattern.search(content)
    return match.group(1).strip() if match else ""

def extract_vue_info(filepath):
    info = {"props": [], "emits": [], "functions": []}
    with open(filepath, encoding="utf-8") as f:
        content = f.read()
    # props
    prop_matches = re.findall(r"defineProps\(\{([^}]*)\}\)", content)
    if prop_matches:
        for match in prop_matches:
            props = [p.split(":")[0].strip() for p in match.split(",") if ":" in p]
            info["props"].extend(props)
    # emits (修正正則)
    emit_matches = re.findall(r"defineEmits\(\[([^\]]*)\]\)", content)
    if not emit_matches:
        emit_matches = re.findall(r"defineEmits\(\s*([a-zA-Z0-9_\'\" ,]+)\s*\)", content)
    if emit_matches:
        for match in emit_matches:
            emits = [e.strip().strip("'\"") for e in match.split(",") if e.strip()]
            info["emits"].extend(emits)
    # functions (script setup)
    func_matches = re.findall(r"function\s+(\w+)\(", content)
    # 補抓 JSDoc
    info["functions"] = []
    for func in func_matches:
        jsdoc = extract_jsdoc(content, func)
        info["functions"].append({"name": func, "jsdoc": jsdoc})
    return info

def extract_js_info(filepath):
    info = {"exports": [], "functions": []}
    with open(filepath, encoding="utf-8") as f:
        content = f.read()
    # export functions
    export_matches = re.findall(r"export function (\w+)\(", content)
    # normal functions
    func_matches = re.findall(r"function (\w+)\(", content)
    info["exports"].extend(export_matches)
    info["functions"] = []
    for func in func_matches:
        jsdoc = extract_jsdoc(content, func)
        info["functions"].append({"name": func, "jsdoc": jsdoc})
    return info

def extract_pinia_info(filepath):
    info = {"state": [], "actions": []}
    with open(filepath, encoding="utf-8") as f:
        content = f.read()
    # state keys
    state_match = re.search(r"state:\s*\(\)\s*=>\s*\{([^}]*)\}", content, re.DOTALL)
    if state_match:
        keys = re.findall(r"(\w+):", state_match.group(1))
        info["state"].extend(keys)
    # actions
    actions_match = re.search(r"actions:\s*\{([^}]*)\}", content, re.DOTALL)
    if actions_match:
        actions = re.findall(r"(\w+)\s*\(", actions_match.group(1))
        info["actions"].extend(actions)
    return info

def main():
    snapshot = {"structure": [], "components": {}, "stores": {}, "router": {}}
    files = list_files_with_info(SRC_DIR)
    snapshot["structure"] = files

    for entry in files:
        path = os.path.join(SRC_DIR, entry["path"])
        if entry["type"] == "file":
            if path.endswith(".vue"):
                info = extract_vue_info(path)
                snapshot["components"][entry["path"]] = info
            elif path.endswith(".js"):
                if "store" in path:
                    info = extract_pinia_info(path)
                    snapshot["stores"][entry["path"]] = info
                elif "router" in path:
                    # router: export routes
                    with open(path, encoding="utf-8") as f:
                        content = f.read()
                    routes = re.findall(r"path:\s*['\"](.*?)['\"]", content)
                    snapshot["router"][entry["path"]] = {"routes": routes}
                else:
                    info = extract_js_info(path)
                    snapshot["components"][entry["path"]] = info

    with open("snapshot.json", "w", encoding="utf-8") as f:
        json.dump(snapshot, f, ensure_ascii=False, indent=2)
    print("網站快照已輸出到 snapshot.json")

if __name__ == "__main__":
    main()
