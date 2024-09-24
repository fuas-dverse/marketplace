# Python Project Template

This is a good starter that has most of the tools we use in our organization already set up.

We have picked a couple of reasonable defaults from the large Python ecosystem.

Use [Issues](https://github.com/fuas-dverse/python-template/issues) for improving or suggesting changes to this template.

- [VS Code](https://code.visualstudio.com) editor (with the Microsoft Python extensions: Python, Python Debugger, Flake and Black)
- [Conda](https://anaconda.org) virtual environments
- [Poetry](https://python-poetry.org)
- [Flake8](https://github.com/PyCQA/flake8)
- [Black](https://github.com/psf/black)
- [Setuptools](https://setuptools.pypa.io)


## Getting started

Do not fork or clone this project. Instead, create a new repository and then under Repository Template select `fuas-dverse/python-template`.

Start coding.

```
cd DIR
conda env create -f environment.yaml
conda activate dverse
poetry install
pre-commit install
code .
```

## Notes

### Virtual environments

The environment that is created can be used to keep Python installations separate from the main one. It also helps with providing clean test environments.

We use Conda virtual environments. There are other solutions (virtualenv and venv) but for me conda works just fine.

```
conda env create -f environment.yaml
conda activate dverse
```


### Pre-commit

[Pre-commit](https://pre-commit.com) helps maintain Git hook scripts. It will get automatically installed. But you will have to run `pre-commit install` to install the hook on your own machine. The checks that are being done by the pre-commit script are described in `pre-commit-config.yaml`.

This script will run quite a few automated checks on your code, and it may even reformat your code.

- Code linting using Flake8
- Code formatting with Black
- Reorder python imports
- Check YAML code
- Fix whitespace issues
- Check `setup.cfg`

This seems quite agressive but once you get used to it you just stop worrying about certain formatting issues, and the commits will be cleaner.


## Todo

We will use this template to provide a basic Python set up for new code projects and offer a good starting point based on good practices.

For now I prefer to get issues reported to me personally. You can verify [Issues](https://github.com/fuas-dverse/python-template/issues) to see what changes are planned.

