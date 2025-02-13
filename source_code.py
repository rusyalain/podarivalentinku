import os

dir = os.getcwd()

exclude = ['.git']

def tree(path):
    for name in os.listdir(path):
        if (name in exclude):
            continue
        if os.path.isfile(f"{path}/{name}"):
            print(f"// {name}\n{open(f"{path}/{name}", "r", encoding="utf8").read()}\n// end {name}{2 * '\n'}")
        else:
            tree(f"{path}/{name}")

tree(dir)