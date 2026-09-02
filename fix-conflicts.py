import re
import sys

with open(sys.argv[1], 'r') as f:
    c = f.read()
if '<<<<<<< HEAD' in c:
        c = re.sub(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>>.*?\n', lambda m: m.group(1) if m.group(1) is not None else m.group(2), c)
    with open(sys.argv[1], 'w') as f:
        f.write(c)
    print('Done')
