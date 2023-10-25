import logging
import functools, os

"""
usage : 

@log_error("./log.txt")
def divde(a,b) :
    return a/b

"""


def _generate_log(path):
    """
    Create a logger object
    :param path: Path of the log file.
    :return: Logger object.
    """
    # Create a logger and set the level.
    logger = logging.getLogger('LogError')
    logger.setLevel(logging.ERROR)
    file_handler = logging.FileHandler(path)
    log_format = '%(levelname)s %(asctime)s %(message)s'
    formatter = logging.Formatter(log_format)
    file_handler.setFormatter(formatter)
    logger.handlers = []  # No duplicated handlers
    logger.propagate = False
    logger.addHandler(file_handler)
    return logger


def log_error(path='<path>/log.error.log'):
    """
    We create a parent function to take arguments
    :param path:
    :return:
    """

    def error_log(func):

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logger = _generate_log(path)
                error_msg = f"And error has occurred at / ```{func.__qualname__}``` \n args : {args} \n kwargs : {kwargs}"
                logger.exception(error_msg)
                return e  # Or whatever message you want.

        return wrapper

    return error_log