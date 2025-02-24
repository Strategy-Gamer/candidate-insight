# Installing pyscopg
pyscopg is required to run the db_handling.py file. In order to install it (you need pip version 20.3 as well):

pip install --upgrade pip
pip install "psycopg[binary]"

It also required some fiddling on my part to get it to work, including adding a PYTHONPATH environment variable

# Using your database
You need to go into db_handling.py and change line 4 to use your password instead. You may also have to change the database name line on line 5. Otherwise it will not work.