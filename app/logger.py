



import logging
import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
        "level": record.levelname,
        "message": record.getMessage(),
        "module": record.module,
        "time": self.formatTime(record)
    }
        return json.dumps(log_data)

def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    
    logger.setLevel(logging.DEBUG)
    
    handler = logging.StreamHandler()
    handler.setFormatter(JSONFormatter())
    
    if not logger.handlers:
        logger.addHandler(handler)
    
    return logger