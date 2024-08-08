function base64toBlob(base64: string, contentType = 'image/png') {
  return fetch(base64)
    .then((response) => response.blob())
    .then((blob) => new Blob([blob], { type: contentType }));
}

export function saveAsImage(base64: string, filename: string) {
  base64toBlob(base64).then((blob) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
  });
}
