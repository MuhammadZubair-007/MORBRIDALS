export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("File upload failed")
  }

  const data = await response.json()
  return data.url
}

export async function deleteFile(url: string): Promise<boolean> {
  const response = await fetch("/api/upload", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    throw new Error("File deletion failed")
  }

  return true
}
