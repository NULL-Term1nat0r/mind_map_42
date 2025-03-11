import os

def find_js_files(root_folder):
    js_files = []
    for dirpath, dirnames, filenames in os.walk(root_folder):
        for file in filenames:
            if file.endswith('.js'):
                full_path = os.path.join(dirpath, file)
                js_files.append(full_path)
    return js_files

def export_js_contents(js_files, output_file):
    with open(output_file, 'w', encoding='utf-8') as out_file:
        for file_path in js_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as js_file:
                    content = js_file.read()

                # Write title and content to the output file
                out_file.write(f"title {os.path.basename(file_path)}\n")
                out_file.write(f"{content}\n\n")
            
            except Exception as e:
                print(f"Failed to read {file_path}: {e}")

if __name__ == "__main__":
    folder_to_search = 'components'  # Change this to your folder path
    output_text_file = 'output.txt'           # Output file name

    js_files = find_js_files(folder_to_search)
    print(f"Found {len(js_files)} JS files. Writing to {output_text_file}...")

    export_js_contents(js_files, output_text_file)

    print("Done!")
