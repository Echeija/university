import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # We want to find cases of className="... grid-cols-X ..." where X is 2-6
    # and it does NOT have sm:grid-cols-, md:grid-cols-, etc.
    
    # Let's find all occurrences of grid-cols-[2-6]
    # We will just replace "grid-cols-X" with "grid-cols-1 md:grid-cols-X"
    # if it's not preceded by a responsive prefix (:, meaning sm: md: etc)
    # Regex: match "grid-cols-X", ensuring no ':' right before it, and replace.
    # To avoid double replacing, we also check if 'grid-cols-1 md:grid-cols-X' is not already there.

    def replacer(match):
        full_match = match.group(0)
        prefix = match.group(1) # The char before "grid-cols"
        if prefix in [':']:
            return full_match # It's like md:grid-cols-2, don't touch
        num = match.group(2)
        # We will make it grid-cols-1 md:grid-cols-X (or grid-cols-2 md:grid-cols-4 if num is 4, etc. let's just do grid-cols-1 sm:grid-cols-X for 2, and grid-cols-1 md:grid-cols-X for >2)
        
        # But wait, what if the string already has grid-cols-1? The regex wouldn't match grid-cols-1, it matches grid-cols-[2-6].
        return f"{prefix}grid-cols-1 md:grid-cols-{num}"

    new_content = re.sub(r'([^:]?)grid-cols-([2-6])', replacer, content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.jsx') or file.endswith('.ts') or file.endswith('.js'):
            process_file(os.path.join(root, file))
