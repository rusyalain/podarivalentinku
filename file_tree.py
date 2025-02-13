import os

dir = os.getcwd()

exclude = ['.git']

def tree(path, ind):
    for name in os.listdir(path):
        if (name in exclude):
            continue
        if os.path.isfile(f"{path}/{name}"):
            print(f"{ind * "\t"}{name}")
        else:
            print(f"{ind * "\t"}{name}/")
            tree(f"{path}/{name}", ind + 1)

tree(dir, 0)