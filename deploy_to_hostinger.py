
import os
import paramiko
from stat import S_ISDIR

def deploy():
    host = "46.202.197.97"
    port = 65002
    user = "u142089309"
    password = "3Strada666!"
    remote_path = "/domains/kingsdrippingswag.io/public_html/"
    local_path = "./kings-swag-landing/out"

    print(f"Connecting to {host}:{port}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, port=port, username=user, password=password)

    print("Clearing remote directory...")
    ssh.exec_command(f"rm -rf {remote_path}*")

    sftp = ssh.open_sftp()
    
    def upload_dir(local, remote):
        try:
            sftp.mkdir(remote)
        except IOError:
            pass # already exists
        
        for item in os.listdir(local):
            l = os.path.join(local, item)
            r = remote + "/" + item
            if os.path.isdir(l):
                upload_dir(l, r)
            else:
                print(f"Uploading {l} -> {r}")
                sftp.put(l, r)

    print(f"Uploading files from {local_path}...")
    upload_dir(local_path, remote_path)
    
    sftp.close()
    ssh.close()
    print("Deployment complete!")

if __name__ == "__main__":
    deploy()
