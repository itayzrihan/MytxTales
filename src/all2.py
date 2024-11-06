import os
import customtkinter as ctk
from tkinter import messagebox
from tkinter import filedialog  # Added for file dialogs
import json
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import threading
import logging

# Initialize logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize the customtkinter app
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")


class FileSelectorApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("File Selector")
        self.geometry("600x800")
        self.directory = None
        self.file_checkboxes = {}
        self.folder_vars = {}
        self.observer = None

        # Create a frame for the list of files
        self.file_frame = ctk.CTkScrollableFrame(self)
        self.file_frame.pack(fill="both", expand=True, padx=10, pady=10)

        # Button to select directory
        self.select_directory_button = ctk.CTkButton(
            self.file_frame,
            text="Select Directory",
            command=self.select_directory,
        )
        self.select_directory_button.pack(pady=10)

        # Button to add files/folders via drag and drop
        self.add_files_button = ctk.CTkButton(
            self.file_frame,
            text="Add Files/Folders",
            command=self.add_files_folders,
        )
        self.add_files_button.pack(pady=10)

        # Create a frame to hold all buttons in a row
        self.button_frame = ctk.CTkFrame(self)
        self.button_frame.pack(pady=10, padx=10, fill="x")

        # Create buttons and add them to the button frame
        self.generate_button = ctk.CTkButton(
            self.button_frame,
            text="Create Codebase Context",
            command=self.create_codebase_context,
        )
        self.generate_button.pack(side="left", padx=5)

        self.structure_button = ctk.CTkButton(
            self.button_frame, text="Create Structure", command=self.create_structure
        )
        self.structure_button.pack(side="left", padx=5)

        self.live_context_button = ctk.CTkButton(
            self.button_frame,
            text="Start Live Context",
            command=self.toggle_live_context,
            fg_color="green",
        )
        self.live_context_button.pack(side="left", padx=5)

        self.refresh_button = ctk.CTkButton(
            self.button_frame,
            text="Refresh Files and Folders",
            command=self.refresh_files,
        )
        self.refresh_button.pack(side="left", padx=5)

        self.text_box = ctk.CTkTextbox(self, wrap="word", height=200)
        self.text_box.pack(fill="both", expand=True, padx=10, pady=10)

        # Copy button
        self.copy_button = ctk.CTkButton(
            self, text="Copy to Clipboard", command=self.copy_to_clipboard
        )
        self.copy_button.pack(pady=10)

        # Add "?" button in the bottom right corner
        self.help_button = ctk.CTkButton(
            self, text="?", width=30, height=30, command=self.show_help
        )
        self.help_button.place(relx=1.0, rely=1.0, anchor="se", x=-10, y=-10)

    def select_directory(self):
        directory = filedialog.askdirectory()
        if directory:
            self.directory = directory
            self.show_top_level_folders_and_files()

    def show_top_level_folders_and_files(self):
        # Clear any existing widgets in the file_frame
        self.clear_file_list()
        self.file_checkboxes = {}
        self.folder_vars = {}
        self.top_level_vars = {}

        # List top-level folders and files
        entries = os.listdir(self.directory)
        for entry in entries:
            entry_path = os.path.join(self.directory, entry)
            var = ctk.StringVar(value="1")
            checkbox = ctk.CTkCheckBox(
                self.file_frame, text=entry, variable=var, onvalue="1", offvalue="0"
            )
            checkbox.pack(anchor="w", padx=10, pady=2)
            self.top_level_vars[entry] = var

        # Add a button to proceed to load selected folders and files
        self.load_selected_button = ctk.CTkButton(
            self.file_frame,
            text="Load Selected Folders and Files",
            command=self.load_selected_entries,
        )
        self.load_selected_button.pack(pady=10)

    def load_selected_entries(self):
        selected_entries = [entry for entry, var in self.top_level_vars.items() if var.get() == "1"]
        self.populate_files(selected_entries)

    def populate_files(self, selected_entries):
        self.clear_file_list()  # Clear any existing file checkboxes
        self.file_checkboxes = {}
        self.folder_vars = {}

        for entry in selected_entries:
            entry_path = os.path.join(self.directory, entry)
            if os.path.isdir(entry_path):
                # Process the directory
                self.process_directory(entry_path, parent_frame=self.file_frame)
            elif os.path.isfile(entry_path):
                # Process the file
                file_rel_path = os.path.relpath(entry_path, self.directory)
                var = ctk.StringVar(value="1")
                checkbox = ctk.CTkCheckBox(
                    self.file_frame, text=entry, variable=var, onvalue="1", offvalue="0"
                )
                checkbox.pack(anchor="w", padx=10, pady=2)
                self.file_checkboxes[file_rel_path] = var

    def process_directory(self, directory_path, parent_frame):
        dir_name = os.path.basename(directory_path)
        dir_rel_path = os.path.relpath(directory_path, self.directory)
        dir_var = ctk.StringVar(value="1")  # Mark folders by default
        self.folder_vars[dir_rel_path] = dir_var

        dir_frame = ctk.CTkFrame(parent_frame)
        dir_frame.pack(fill="x", padx=10, pady=2)
        dir_checkbox = ctk.CTkCheckBox(
            dir_frame,
            text=dir_name,
            variable=dir_var,
            onvalue="1",
            offvalue="0",
            command=lambda r=dir_rel_path: self.toggle_folder(r),
        )
        dir_checkbox.pack(anchor="w", padx=10, pady=2)
        self.folder_vars[dir_rel_path + "_frame"] = dir_frame

        # Process subdirectories and files
        try:
            entries = os.listdir(directory_path)
        except PermissionError:
            logging.error("Permission denied accessing directory: %s", directory_path)
            return

        for entry in entries:
            entry_path = os.path.join(directory_path, entry)
            if os.path.isdir(entry_path):
                self.process_directory(entry_path, parent_frame=dir_frame)
            elif os.path.isfile(entry_path):
                file_rel_path = os.path.relpath(entry_path, self.directory)
                var = ctk.StringVar(value="1")  # Mark files by default
                checkbox = ctk.CTkCheckBox(
                    dir_frame, text=entry, variable=var, onvalue="1", offvalue="0"
                )
                checkbox.pack(anchor="w", padx=20, pady=2)
                self.file_checkboxes[file_rel_path] = var

    def clear_file_list(self):
        logging.debug("Clearing file list")
        for widget in self.file_frame.winfo_children():
            widget.destroy()

    def toggle_folder(self, folder_rel_path):
        logging.debug("Toggling folder: %s", folder_rel_path)
        folder_var = self.folder_vars[folder_rel_path]
        new_state = folder_var.get()
        for file_rel_path, var in self.file_checkboxes.items():
            if file_rel_path.startswith(folder_rel_path):
                var.set(new_state)

    def create_codebase_context(self):
        logging.debug("Creating codebase context")
        codebase_context = ""
        for file_rel_path, var in self.file_checkboxes.items():
            if var.get() == "1":  # If file is checked
                file_path = os.path.join(self.directory, file_rel_path)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        logging.debug("Reading file: %s", file_path)
                        codebase_context += f"\n# File: {file_rel_path}\n"
                        codebase_context += f.read()
                        codebase_context += "\n" + ("-" * 80) + "\n"
                except Exception as e:
                    logging.error("Could not read file: %s, Error: %s", file_rel_path, str(e))
                    # If an error occurs, just add the file path to the context
                    codebase_context += f"\n# Could not read file: {file_rel_path}\n"
                    codebase_context += f"# Error: {str(e)}\n"
                    codebase_context += "\n" + ("-" * 80) + "\n"

        self.text_box.delete("1.0", ctk.END)
        self.text_box.insert(ctk.END, codebase_context)

    def create_structure(self):
        logging.debug("Creating file structure JSON")
        structure = self.generate_structure_json(self.directory)
        structure_json = json.dumps(structure, indent=2)
        self.text_box.delete("1.0", ctk.END)
        self.text_box.insert(ctk.END, structure_json)

    def generate_structure_json(self, current_dir):
        logging.debug("Generating structure JSON for directory: %s", current_dir)
        structure = {}
        for root, dirs, files in os.walk(current_dir):
            logging.debug("Walking through directory: %s", root)
            current_level = structure
            rel_path = os.path.relpath(root, self.directory)
            if rel_path == ".":
                rel_path = ""
            else:
                for part in rel_path.split(os.sep):
                    current_level = current_level.setdefault(part, {})

            for dir_name in dirs:
                dir_rel_path = os.path.relpath(os.path.join(root, dir_name), self.directory)
                if dir_rel_path in self.folder_vars and self.folder_vars[dir_rel_path].get() == "1":
                    logging.debug("Adding directory to structure: %s", dir_name)
                    current_level[dir_name] = {}

            for file_name in files:
                file_rel_path = os.path.relpath(os.path.join(root, file_name), self.directory)
                if file_rel_path in self.file_checkboxes and self.file_checkboxes[file_rel_path].get() == "1":
                    logging.debug("Adding file to structure: %s", file_name)
                    current_level[file_name] = ""

        return structure

    def refresh_files(self):
        logging.debug("Refreshing files and folders")
        if self.directory:
            self.show_top_level_folders_and_files()

    def toggle_live_context(self):
        if self.observer is None:
            logging.debug("Starting live context")
            self.start_live_context()
        else:
            logging.debug("Stopping live context")
            self.stop_live_context()

    def start_live_context(self):
        logging.debug("Starting live context monitoring")
        self.live_context_button.configure(text="Stop Live Context", fg_color="red")
        event_handler = FileChangeHandler(self)
        self.observer = Observer()
        self.observer.schedule(event_handler, self.directory, recursive=True)
        self.observer.start()
        self.create_codebase_context()

    def stop_live_context(self):
        logging.debug("Stopping live context monitoring")
        self.live_context_button.configure(text="Start Live Context", fg_color="green")
        if self.observer:
            self.observer.stop()
            self.observer.join()
            self.observer = None

    def on_file_changed(self, file_path):
        logging.debug("File changed: %s", file_path)
        file_rel_path = os.path.relpath(file_path, self.directory)
        if (
            file_rel_path in self.file_checkboxes
            and self.file_checkboxes[file_rel_path].get() == "1"
        ):
            self.create_codebase_context()

    def copy_to_clipboard(self):
        logging.debug("Copying content to clipboard")
        self.clipboard_clear()
        self.clipboard_append(self.text_box.get("1.0", ctk.END))
        messagebox.showinfo("Copied", "Content copied to clipboard!")

    def show_help(self):
        logging.debug("Showing help window")
        # Create a new window to display the features list
        help_window = ctk.CTkToplevel(self)
        help_window.title("Features to Develop")
        help_window.geometry("300x200")

        # Textbox to display the features
        help_text = ctk.CTkTextbox(help_window, wrap="word")
        help_text.pack(fill="both", expand=True, padx=10, pady=10)

        # Example features list - replace with your actual features
        features = """
        - Feature 1: Add support for multiple file types.
        - Feature 2: Implement file search functionality.
        - Feature 3: Integrate with version control systems.
        - Feature 4: Improve UI/UX design.
        - Feature 5: Implement code snippet management.
        - Feature 6: unlimited ctrl+z with DB backup for any change history
        
        1. Search and Filter Functionality:
        Search within Files: Add a search bar that allows users to search for specific text within the files. This can be especially useful when dealing with large codebases. Highlight the matching text within the files displayed in the TextBox.
        Filter Files and Folders: Implement a filter option to allow users to quickly find specific files or folders by name.
        2. Diff Viewer:
        Version Control and Diff: Implement a basic version control system within the app. Users could save different versions of their codebase context and compare changes between versions with a visual diff viewer.
        3. Code Snippet Management:
        Snippet Library: Allow users to save portions of their code as snippets within the app. These snippets could be tagged, categorized, and easily inserted into the current context.
        Snippet Suggestions: As the user types or selects files, suggest related code snippets from the library that might be useful.
        4. Collaborative Editing:
        Live Collaboration: Implement a feature for real-time collaborative editing, where multiple users can connect and work on the same codebase context simultaneously.
        Comments and Annotations: Allow users to add comments or annotations to specific parts of the codebase context. These comments could be used for team discussions or personal notes.
        5. File Synchronization:
        Cloud Synchronization: Integrate with cloud storage services like Google Drive, Dropbox, or GitHub. This allows users to sync their codebase contexts across different devices.
        Auto-Backup: Implement an automatic backup feature that saves the current state of the codebase context periodically.
        6. Advanced Code Analysis:
        Static Analysis: Integrate a static analysis tool that provides code quality insights, detects potential bugs, and suggests improvements. Display this information within the app alongside the codebase context.
        Dependency Analysis: Visualize dependencies between files or modules in the codebase. This can help users understand how different parts of the codebase interact with each other.
        7. Custom Theming and Appearance:
        Theme Customization: Allow users to customize the appearance of the app, including fonts, colors, and overall theme. Provide a set of predefined themes, such as light, dark, and high-contrast, or allow users to create their own.
        Syntax Highlighting: Add syntax highlighting to the TextBox where the code is displayed. This will make the code easier to read and edit.
        8. AI-Assisted Features:
        AI-Powered Code Suggestions: Integrate an AI-powered code suggestion tool that helps users write code faster by providing autocomplete suggestions, potential bug fixes, or even entire code snippets.
        Natural Language Processing (NLP): Allow users to write natural language descriptions or commands that are then translated into code or specific actions within the app. For example, "Show me all Python files modified in the last week" could filter and display the relevant files.
        9. Project Statistics:
        Codebase Statistics: Provide users with detailed statistics about their codebase, such as the number of lines of code, most frequently modified files, and even code complexity metrics.
        Activity Monitoring: Track and display activity over time, showing users which files were most recently modified, how much time was spent on different parts of the codebase, etc.
        10. Task and Issue Tracking:
        Integrated Task Management: Allow users to create tasks or issues related to specific files or code sections. These could be displayed alongside the code and marked as complete when resolved.
        GitHub/GitLab Integration: Integrate with GitHub or GitLab to synchronize issues and tasks from a repository with your app's interface.
        """

        help_text.insert(ctk.END, features)
        help_text.configure(state="disabled")  # Make the text read-only

    def add_files_folders(self):
        paths = filedialog.askopenfilenames()
        if paths:
            for path in paths:
                if os.path.isfile(path):
                    if self.directory is None:
                        self.directory = os.path.dirname(path)
                    file_rel_path = os.path.relpath(path, self.directory)
                    var = ctk.StringVar(value="1")
                    checkbox = ctk.CTkCheckBox(
                        self.file_frame, text=file_rel_path, variable=var, onvalue="1", offvalue="0"
                    )
                    checkbox.pack(anchor="w", padx=10, pady=2)
                    self.file_checkboxes[file_rel_path] = var

        # For folders, you may need to use askdirectory or implement a custom solution

class FileChangeHandler(FileSystemEventHandler):
    def __init__(self, app):
        super().__init__()
        self.app = app

    def on_modified(self, event):
        logging.debug("File modified: %s", event.src_path)
        if not event.is_directory:
            self.app.on_file_changed(event.src_path)

    def on_created(self, event):
        logging.debug("File created: %s", event.src_path)
        if not event.is_directory:
            self.app.on_file_changed(event.src_path)

    def on_deleted(self, event):
        logging.debug("File deleted: %s", event.src_path)
        if not event.is_directory:
            self.app.on_file_changed(event.src_path)


if __name__ == "__main__":
    logging.debug("Starting FileSelectorApp")
    app = FileSelectorApp()
    app.mainloop()
