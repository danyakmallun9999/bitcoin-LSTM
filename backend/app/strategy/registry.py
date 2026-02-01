from typing import Dict, Type
from app.strategy.base import BaseStrategy

class StrategyRegistry:
    def __init__(self):
        self._strategies: Dict[str, BaseStrategy] = {}
        self._registry: Dict[str, Type[BaseStrategy]] = {}

    def register_class(self, name: str, cls: Type[BaseStrategy]):
        """Register a strategy class by name"""
        self._registry[name] = cls

    def create_instance(self, name: str, instance_id: str, config: dict) -> BaseStrategy:
        """Create a running instance of a strategy"""
        if name not in self._registry:
            raise ValueError(f"Strategy {name} not found in registry.")
        
        strategy_cls = self._registry[name]
        instance = strategy_cls(instance_id, config)
        self._strategies[instance_id] = instance
        return instance

    def get_instance(self, instance_id: str) -> BaseStrategy:
        return self._strategies.get(instance_id)

# Global Registry
strategy_registry = StrategyRegistry()
