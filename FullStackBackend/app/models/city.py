from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship

from app.database.database import Base


class City(Base):
    __tablename__ = "cities"

    id        = Column(Integer, primary_key=True, index=True)
    city_name = Column(String(100), unique=True, index=True, nullable=False)
    latitude  = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    zones = relationship("Zone", back_populates="city", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<City id={self.id} name={self.city_name}>"
