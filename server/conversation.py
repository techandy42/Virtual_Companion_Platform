from langchain.chat_models import ChatOpenAI
from langchain.chains import ConversationChain
from langchain.chains.conversation.memory import ConversationSummaryBufferMemory
from langchain.callbacks import get_openai_callback
from dotenv import load_dotenv
import os

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")

def count_tokens(chain, query):
    with get_openai_callback() as cb:
        result = chain.run(query)
        print(f'Spent a total of {cb.total_tokens} tokens')

    return result

# first initialize the large language model
llm = ChatOpenAI(
	temperature=0,
	openai_api_key=openai_api_key,
	model_name="gpt-4-0613"
)

# now initialize the conversation chain
conversation_sum_bufw = ConversationChain(
    llm=llm, 
    memory=ConversationSummaryBufferMemory(llm=llm, max_token_limit=650)
)

count_tokens(
    conversation_sum_bufw, 
    "My interest here is to explore the potential of integrating Large Language Models with external knowledge"
)

count_tokens(
    conversation_sum_bufw,
    "I just want to analyze the different possibilities. What can you think of?"
)

count_tokens(
    conversation_sum_bufw, 
    "Which data source types could be used to give context to the model?"
)

count_tokens(
    conversation_sum_bufw, 
    "What is my aim again?"
)

sum_bufw_history = conversation_sum_bufw.memory.load_memory_variables(
    inputs=[]
)['history']

print(sum_bufw_history)
