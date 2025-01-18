from sqlalchemy import create_engine, MetaData
from sqlalchemy_schemadisplay import create_schema_graph
from config import Config

# Create SQLAlchemy engine
engine = create_engine(Config.LOCAL_DATABASE_URL)

# Generate the schema graph
graph = create_schema_graph(
    metadata=MetaData(),
    engine=engine,
    show_datatypes=True,
    show_indexes=True,
    rankdir="LR",
)

# Save the diagram to a file
graph.write("schema_diagram.png", format="png")
print("Schema diagram saved as schema_diagram.png")
