import re
import sys

def patch_latex_strings(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    def fix_latex_string(match):
        prefix = match.group(1)  # latex:"
        body = match.group(2)    # string content
        suffix = match.group(3)  # "
        # Replace four backslashes with two inside the latex string literal
        fixed_body = body.replace('\\\\\\\\', '\\\\')
        return prefix + fixed_body + suffix

    # Match latex:"..." where ... does not contain an unescaped double quote
    # In JS string literals, quotes inside are escaped as \"
    pattern = r'(latex:")((?:[^"\\]|\\.)*)(")'
    content = re.sub(pattern, fix_latex_string, content)

    if content == original:
        print('No changes made.')
        return

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'Patched {filepath}')

if __name__ == '__main__':
    patch_dist_latex_strings(sys.argv[1] if len(sys.argv) > 1 else 'dist/assets/index-DmUJCYoB.js')
