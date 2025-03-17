import os
import re
import random
import time
import streamlit as st
from mistralai import Mistral
from typing import List, Tuple

# Initialize Mistral client
api_key = "IbvRHlYdTTngK0y3ORTLYjGDUj56YzJM"
client = Mistral(api_key=api_key)

# Max token limit for Mistral (8k tokens)
MAX_TOKENS = 8000

# Function to retry requests in case of rate limiting
def retry_request(func, max_retries=5, backoff_factor=2):
    retries = 0
    while retries < max_retries:
        try:
            return func()
        except Exception as e:
            if "429" in str(e):  # Check for rate limit error
                retries += 1
                wait_time = backoff_factor ** retries + random.uniform(0, 1)
                print(f"Rate limit exceeded. Retrying in {wait_time:.2f} seconds...")
                time.sleep(wait_time)
            else:
                raise e
    raise Exception("Max retries reached. Could not complete the request.")

# Function to get all code files with specific extensions in a folder
def get_code_files(folder_path: str, file_extensions: List[str]) -> List[str]:
    code_files = []
    for root, _, files in os.walk(folder_path):
        for file in files:
            if any(file.endswith(ext) for ext in file_extensions):
                code_files.append(os.path.join(root, file))
    return code_files

# Function to read code file content
def read_code_file(file_path: str) -> str:
    with open(file_path, 'r') as file:
        return file.read()

# Function to chunk code based on functions, classes, or CSS rules
def chunk_code(code: str, file_extension: str) -> List[str]:
    chunks = []
    
    if file_extension == ".py":
        function_pattern = re.compile(r'(def .+?:\n(?:\s{4}.+\n)+)', re.DOTALL)
        class_pattern = re.compile(r'(class .+?:\n(?:\s{4}.+\n)+)', re.DOTALL)
    elif file_extension == ".js":
        function_pattern = re.compile(r'(function \w+\(.*?\)\s*{.*?})', re.DOTALL)
        class_pattern = re.compile(r'(class \w+\s*{.*?})', re.DOTALL)
    elif file_extension in [".c", ".cpp", ".h", ".hpp"]:
        function_pattern = re.compile(r'(\w+\s+\w+\(.*?\)\s*{.*?})', re.DOTALL)
        class_pattern = re.compile(r'(class \w+\s*{.*?})', re.DOTALL)
    elif file_extension == ".css":
        css_rule_pattern = re.compile(r'([^{}]*\{[^{}]*\})', re.DOTALL)
        chunks.extend(css_rule_pattern.findall(code))
    
    if file_extension != ".css":
        functions = function_pattern.findall(code)
        classes = class_pattern.findall(code)
        chunks.extend(functions)
        chunks.extend(classes)
    
    # If no functions, classes, or CSS rules are found, treat the entire file as a single chunk
    if not chunks:
        chunks.append(code)
    
    chunks = [chunk for chunk in chunks if chunk.strip() != ""]
    
    final_chunks = []
    for chunk in chunks:
        # Preserve newlines and original formatting
        if len(chunk) <= MAX_TOKENS * 4:  # Approximate token count (1 token ≈ 4 characters)
            final_chunks.append(chunk)
        else:
            # If the chunk is too large, split it into smaller parts while preserving newlines
            lines = chunk.splitlines()
            current_chunk = []
            current_length = 0
            for line in lines:
                if current_length + len(line) + 1 <= MAX_TOKENS * 4:  # +1 for the newline character
                    current_chunk.append(line)
                    current_length += len(line) + 1
                else:
                    final_chunks.append('\n'.join(current_chunk))
                    current_chunk = [line]
                    current_length = len(line) + 1
            if current_chunk:
                final_chunks.append('\n'.join(current_chunk))
    
    return final_chunks

# Function to embed a code chunk
def embed_code_chunk(chunk: str, file_path: str) -> List[float]:
    try:
        response = retry_request(lambda: client.embeddings.create(
            model="mistral-embed",
            inputs=[chunk]
        ))
        embedding = response.data[0].embedding
        return embedding
    except Exception as e:
        print(f"Error embedding code chunk: {e}")
        return []

# Function to build the context prompt for the user query
def build_context_prompt(query: str, relevant_chunks: List[str]) -> str:
    context = "\n".join(relevant_chunks[:5])
    return f"Question: {query}\nContext:\n{context}"

# Function to retrieve relevant code chunks for the query
def get_relevant_chunks(query: str, embeddings: List[Tuple[str, List[float], str]]) -> List[Tuple[str, List[float], str]]:
    """
    Retrieve relevant chunks based on the query.
    Returns a list of tuples: (chunk, embedding, file_path).
    """
    if not embeddings:
        return []
    
    # For now, return all chunks (you can add relevance scoring logic later)
    return embeddings

# Function to get the response from the chatbot using the context
def get_bot_response(user_message: str, relevant_chunks: List[str]) -> str:
    context_prompt = build_context_prompt(user_message, relevant_chunks)
    
    try:
        chat_response = retry_request(lambda: client.chat.complete(
            model="mistral-small-latest",
            messages=[{"role": "user", "content": context_prompt}]
        ))
        return chat_response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating response: {e}")
        return ""

# Streamlit interface
def main():
    # Set Streamlit page config
    st.set_page_config(page_title="Code Query Chatbot", page_icon="🤖", layout="wide")

    # Initialize session state for chat history and selected conversation
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = {}  # Dictionary to store multiple conversations
    if "selected_conversation" not in st.session_state:
        st.session_state.selected_conversation = None  # Track the currently selected conversation
    if "show_context" not in st.session_state:
        st.session_state.show_context = False  # Track whether to show the context

    # Title
    st.title("Code Query Chatbot with Context")

    # Help section
    with st.expander("How to use this app"):
        st.markdown("""
        1. **Enter the folder path**: Provide the path to your project folder.
        2. **Select file extensions**: Choose the types of files you want to analyze.
        3. **Ask a question**: Type your question about the code in the chat window.
        4. **View context**: Toggle the context window to see the code used for answering.
        """)

    # Container for file uploader and settings
    with st.container():
        st.subheader("Project Setup")
        
        # File uploader
        uploaded_files = st.file_uploader(
            "Upload your code files",
            type=["js", "py", "c", "cpp", "h", "hpp", "css"],
            accept_multiple_files=True,
            key="file_uploader"
        )

        if uploaded_files:
            code_files = [file.name for file in uploaded_files]
            folder_path = "/tmp/uploaded_files"  # Temporary folder for uploaded files
            os.makedirs(folder_path, exist_ok=True)
            for uploaded_file in uploaded_files:
                with open(os.path.join(folder_path, uploaded_file.name), "wb") as f:
                    f.write(uploaded_file.getbuffer())
        else:
            folder_path = st.text_input("Enter the folder path containing code files:", "./test", key="folder_path")

        # File extensions
        file_extensions = st.multiselect(
            "Select file extensions:",
            options=[".js", ".py", ".c", ".cpp", ".h", ".hpp", ".css"],
            default=[".js", ".py"],
            key="file_extensions"
        )

    # Sidebar for chat history bar
    with st.sidebar:
        st.subheader("Chat History")
        
        # Display list of conversations
        for conversation_id in st.session_state.chat_history:
            if st.button(conversation_id, key=f"conversation_{conversation_id}"):
                st.session_state.selected_conversation = conversation_id
                st.rerun()
        
        # Button to start a new conversation
        if st.button("Start New Conversation"):
            st.session_state.selected_conversation = None
            st.rerun()

    # Toggle button to show/hide context
    if st.button("Show Context"):
        st.session_state.show_context = not st.session_state.show_context
        st.rerun()

    # Context window (hidden by default, shown when toggled)
    if st.session_state.show_context:
        with st.expander("Code Context", expanded=True):
            if "relevant_chunks" in st.session_state:
                # Group relevant chunks by file
                chunks_by_file = {}
                for chunk, _, file_path in st.session_state.relevant_chunks:
                    if file_path not in chunks_by_file:
                        chunks_by_file[file_path] = []
                    chunks_by_file[file_path].append(chunk)
                
                # Display each file's chunks with syntax highlighting
                for file_path, chunks in chunks_by_file.items():
                    st.markdown(f"**File:** `{file_path}`")
                    for chunk in chunks:
                        # Determine the file extension for syntax highlighting
                        ext = os.path.splitext(file_path)[1]
                        st.code(chunk, language=ext[1:])  # Use file extension for syntax highlighting
                    st.markdown("---")  # Add a separator between files

    # Chat window
    st.subheader("Chat Window")

    # Chat input and submit button at the top
    user_input = st.text_input("Ask a question about the code:", key="user_input")
    if st.button("Submit", key="submit_button"):
        # Retrieve files for all selected extensions
        code_files = get_code_files(folder_path, file_extensions)
        embeddings = []
        
        # Show progress bar
        progress_bar = st.progress(0)
        total_files = len(code_files)
        
        # Group chunks by file
        file_chunks = {}
        for i, file_path in enumerate(code_files):
            code = read_code_file(file_path)
            ext = os.path.splitext(file_path)[1]  # Get the file extension
            chunks = chunk_code(code, ext)
            file_chunks[file_path] = chunks
            for chunk in chunks:
                embedding = embed_code_chunk(chunk, file_path)
                if embedding:
                    embeddings.append((chunk, embedding, file_path))  # Include file_path in embeddings
            
            # Update progress bar
            progress_bar.progress((i + 1) / total_files)
        
        # Get relevant chunks based on user query
        st.session_state.relevant_chunks = get_relevant_chunks(user_input, embeddings)
        
        # Get bot response
        bot_response = get_bot_response(user_input, [chunk for chunk, _, _ in st.session_state.relevant_chunks])
        
        # Add user input and bot response to the current conversation
        if st.session_state.selected_conversation is not None:
            st.session_state.chat_history[st.session_state.selected_conversation].append({"user": user_input, "bot": bot_response})
        else:
            # Create a new conversation if none is selected
            conversation_id = f"Conversation {len(st.session_state.chat_history) + 1}"
            st.session_state.chat_history[conversation_id] = [{"user": user_input, "bot": bot_response}]
            st.session_state.selected_conversation = conversation_id
        
        # Rerun to update the chat window
        st.rerun()

    # Display chat history for the selected conversation
    if st.session_state.selected_conversation:
        st.markdown(f"**Current Conversation:** {st.session_state.selected_conversation}")
        for chat in st.session_state.chat_history[st.session_state.selected_conversation]:
            st.markdown(f"**You:** {chat['user']}")
            st.markdown(f"**Bot:** {chat['bot']}")
            st.markdown("---")

if __name__ == "__main__":
    main()