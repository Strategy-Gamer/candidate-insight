import os

# Directory containing the candidate folders
main_dir = "Candidates"

# Loop through each item in the directory
for folder_name in os.listdir(main_dir):
    old_path = os.path.join(main_dir, folder_name)

    # Only rename if it's a directory and contains a dash
    if os.path.isdir(old_path) and '-' in folder_name:
        new_name = folder_name.replace('-', ' ')
        new_path = os.path.join(main_dir, new_name)
        
        # Rename the folder
        os.rename(old_path, new_path)
        print(f"Renamed: {folder_name} → {new_name}")
