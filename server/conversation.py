from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import ConversationChain
from langchain.memory import ConversationSummaryBufferMemory
from supabase_init import supabase
import tiktoken
from pprint import pprint

def num_tokens_from_string(string: str, encoding_name: str) -> int:
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens


def get_conversation(user_id: str, companion_id: str):
    companion = supabase.table('companions') \
    .select('*') \
    .eq('user_id', user_id) \
    .filter('id', 'eq', companion_id) \
    .execute() \
    .data[0]
    
    chat_log = supabase.table('chat_logs') \
    .select('*') \
    .eq('user_id', user_id) \
    .filter('companion_id', 'eq', companion_id) \
    .execute() \
    .data

    chat_log_summary = "\n\n".join(["User: " + chat["user_message"] + "\nAI: " + chat["companion_message"] for chat in chat_log])

    description_token_count = num_tokens_from_string(companion['description'], 'cl100k_base')

    while num_tokens_from_string(chat_log_summary, 'cl100k_base') > (4000 - description_token_count):
        chat_log_summary = chat_log_summary.split('\n\n', 1)[1]

    llm = ChatOpenAI(model_name='gpt-4')
    memory = ConversationSummaryBufferMemory(llm=llm, memory_key="chat_history", input_key="input", max_token_limit=3000)

    _DEFAULT_TEMPLATE = """
    Companion Name:
    <<COMPANION NAME>>

    Companion description:
    <<COMPANION DESCRIPTION>>

    Past conversation:
    <<CHAT LOG SUMMARY>>

    Current conversation:
    {chat_history}
    
    Human: {input}
    AI:
    """

    _DEFAULT_TEMPLATE = _DEFAULT_TEMPLATE.replace('<<COMPANION NAME>>', companion['name'])
    _DEFAULT_TEMPLATE = _DEFAULT_TEMPLATE.replace('<<COMPANION DESCRIPTION>>', companion['description'])
    _DEFAULT_TEMPLATE = _DEFAULT_TEMPLATE.replace('<<CHAT LOG SUMMARY>>', chat_log_summary)

    PROMPT = PromptTemplate(
        input_variables=["input", "chat_history"],
        template=_DEFAULT_TEMPLATE,
    )

    llm = ChatOpenAI(model_name='gpt-4')
    conversation = ConversationChain(llm=llm, verbose=True, memory=memory, prompt=PROMPT)

    return conversation
