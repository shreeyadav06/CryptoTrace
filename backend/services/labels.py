import json
import os

def get_address_label(address: str) -> dict:
    """
    Looks up the address in the verified VASP database (labels.json).
    Returns a dictionary with VASP metadata if found, otherwise None.
    """
    address = address.lower()
    current_dir = os.path.dirname(os.path.abspath(__file__))
    labels_file_path = os.path.join(current_dir, '..', 'data', 'labels.json')
    
    try:
        with open(labels_file_path, 'r', encoding='utf-8') as f:
            labels = json.load(f)
            
        return labels.get(address)
    except Exception:
        return None
