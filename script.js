// TIFFインスタンスとページ情報
let tiffInstance = null;
let currentPage = 0;
let totalPages = 0;

// ファイルアップロードイベントリスナー
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file && file.type === "image/tiff") {
        const reader = new FileReader();
        reader.onload = () => {
            loadTiff(reader.result);
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert("Please upload a valid TIFF file.");
    }
});

// TIFF読み込み関数
function loadTiff(arrayBuffer) {
    try {
        tiffInstance = new Tiff({ buffer: arrayBuffer });
        currentPage = 0;
        totalPages = tiffInstance.countDirectory();
        updateControls();
        renderPage();
    } catch (error) {
        console.error("Error loading TIFF:", error);
        alert("Failed to load the TIFF file.");
    }
}

// 現在のページを描画
function renderPage() {
    if (!tiffInstance) return;

    tiffInstance.setDirectory(currentPage);
    const canvas = tiffInstance.toCanvas();
    const context = tiffCanvas.getContext("2d");

    // キャンバスのアスペクト比を保持
    const imageWidth = canvas.width;
    const imageHeight = canvas.height;

    // キャンバスのサイズを元の画像サイズに基づいて設定
    tiffCanvas.width = imageWidth;
    tiffCanvas.height = imageHeight;

    // 描画
    context.clearRect(0, 0, imageWidth, imageHeight);
    context.drawImage(canvas, 0, 0, imageWidth, imageHeight);

    // ページ情報を更新
    pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
}

// コントロールボタンの状態を更新
function updateControls() {
    prevPageButton.disabled = currentPage === 0;
    nextPageButton.disabled = currentPage >= totalPages - 1;
    savePdfButton.disabled = totalPages === 0;
}

// ページ切り替えボタンのイベント
prevPageButton.addEventListener("click", () => {
    if (currentPage > 0) {
        currentPage--;
        renderPage();
        updateControls();
    }
});
nextPageButton.addEventListener("click", () => {
    if (currentPage < totalPages - 1) {
        currentPage++;
        renderPage();
        updateControls();
    }
});

// PDF保存ボタンのイベント
savePdfButton.addEventListener("click", () => {
    if (!tiffInstance) return;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // 各ページをPDFに追加
    for (let i = 0; i < totalPages; i++) {
        tiffInstance.setDirectory(i);
        const canvas = tiffInstance.toCanvas();
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297); // A4サイズにフィット
    }

    // Blob形式でPDFデータを取得
    const pdfBlob = pdf.output("blob");

    // BlobからURLを作成
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // 新しいタブでPDFを表示
    window.open(pdfUrl, "_blank");
});
