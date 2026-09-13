from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

setup(
	name="jay_desk_style",
	version="0.0.1",
	description="Custom Desk styling, greeting banner, and notifications for Jay",
	author="Aroma 24/7",
	author_email="jay@aroma-247.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
