const User = require('../models/User');
const Progress = require('../models/Progress');
const Achievement = require('../models/Achievement');
const PDFDocument = require('pdfkit');

// @desc    Export user progress as CSV
// @route   GET /api/export/progress/csv
// @access  Protected (Student - own data, Admin - any user)
const exportProgressCSV = async (req, res) => {
  try {
    const { userId } = req.query;
    const targetUserId = userId || req.user._id;

    // Check authorization
    if (req.user.role !== 'admin' && targetUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Tidak diizinkan mengakses data pengguna lain' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    const progress = await Progress.findOne({ user: targetUserId });
    if (!progress) {
      return res.status(404).json({ message: 'Progress tidak ditemukan' });
    }

    // Build CSV content
    let csvContent = 'LAPORAN PROGRESS SISWA\n\n';
    csvContent += `Username,${user.username}\n`;
    csvContent += `Email,${user.email || 'N/A'}\n`;
    csvContent += `Tanggal Export,${new Date().toLocaleDateString('id-ID')}\n\n`;
    csvContent += `Level,Status,Skor Tertinggi,Tanggal Selesai\n`;

    progress.levelProgress.forEach((lp) => {
      const completedDate = lp.completedAt ? new Date(lp.completedAt).toLocaleDateString('id-ID') : 'Belum';
      csvContent += `${lp.levelNumber},${lp.status},${lp.highScore}%,"${completedDate}"\n`;
    });

    // Summary
    const completedLevels = progress.levelProgress.filter((lp) => lp.status === 'completed').length;
    const avgScore =
      completedLevels > 0
        ? Math.round(progress.levelProgress.reduce((sum, lp) => sum + (lp.status === 'completed' ? lp.highScore : 0), 0) / completedLevels)
        : 0;

    csvContent += `\nRINGKASAN\n`;
    csvContent += `Total Level Selesai,${completedLevels}\n`;
    csvContent += `Rata-rata Skor,${avgScore}%\n`;

    // Set headers
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="progress_${user.username}_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export progress CSV error:', error);
    res.status(500).json({ message: 'Gagal mengekspor progress' });
  }
};

// @desc    Export user progress as PDF
// @route   GET /api/export/progress/pdf
// @access  Protected (Student - own data, Admin - any user)
const exportProgressPDF = async (req, res) => {
  try {
    const { userId } = req.query;
    const targetUserId = userId || req.user._id;

    // Check authorization
    if (req.user.role !== 'admin' && targetUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Tidak diizinkan mengakses data pengguna lain' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    const progress = await Progress.findOne({ user: targetUserId });
    const achievements = await Achievement.find({ user: targetUserId }).sort({ unlockedAt: -1 });

    if (!progress) {
      return res.status(404).json({ message: 'Progress tidak ditemukan' });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 40, bufferPages: true });
    const filename = `progress_${user.username}_${Date.now()}.pdf`;

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe to response
    doc.pipe(res);

    // Title
    doc.fontSize(24).font('Helvetica-Bold').text('LAPORAN PROGRESS SISWA', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(`SAKA - Smart Application for Kids Speaking Activity`, { align: 'center' });
    doc.moveDown(1);

    // User info
    doc.fontSize(12).font('Helvetica-Bold').text('Informasi Siswa', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Username: ${user.username}`);
    doc.text(`Email: ${user.email || 'N/A'}`);
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`);
    doc.moveDown(1);

    // Calculate stats
    const completedLevels = progress.levelProgress.filter((lp) => lp.status === 'completed').length;
    const totalLevels = progress.levelProgress.length;
    const avgScore =
      completedLevels > 0
        ? Math.round(progress.levelProgress.reduce((sum, lp) => sum + (lp.status === 'completed' ? lp.highScore : 0), 0) / completedLevels)
        : 0;

    // Stats
    doc.fontSize(12).font('Helvetica-Bold').text('Ringkasan Statistik', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total Level: ${totalLevels}`);
    doc.text(`Level Selesai: ${completedLevels}/${totalLevels}`);
    doc.text(`Rata-rata Skor: ${avgScore}%`);
    doc.moveDown(1);

    // Progress table
    doc.fontSize(12).font('Helvetica-Bold').text('Detail Progress Per Level', { underline: true });
    doc.fontSize(9).font('Helvetica');

    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 150;
    const col3 = 250;
    const col4 = 350;
    const rowHeight = 20;

    // Table header
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Level', col1, tableTop)
      .text('Status', col2, tableTop)
      .text('Skor', col3, tableTop)
      .text('Tanggal', col4, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(500, tableTop + 15).stroke();

    let yPosition = tableTop + 20;

    // Table rows
    progress.levelProgress.forEach((lp) => {
      const completedDate = lp.completedAt ? new Date(lp.completedAt).toLocaleDateString('id-ID') : 'Belum';
      const statusText = lp.status === 'completed' ? '✓ Selesai' : lp.status === 'unlocked' ? 'Terbuka' : 'Terkunci';

      doc
        .fontSize(9)
        .font('Helvetica')
        .text(`${lp.levelNumber}`, col1, yPosition)
        .text(statusText, col2, yPosition)
        .text(`${lp.highScore}%`, col3, yPosition)
        .text(completedDate, col4, yPosition);

      yPosition += rowHeight;
    });

    doc.moveDown(2);

    // Achievements section if any
    if (achievements.length > 0) {
      doc.addPage();
      doc.fontSize(12).font('Helvetica-Bold').text('Prestasi yang Dikunci', { underline: true });
      doc.moveDown(0.5);

      achievements.forEach((achievement, index) => {
        const unlockedDate = new Date(achievement.unlockedAt).toLocaleDateString('id-ID');
        doc.fontSize(10).font('Helvetica-Bold').text(`${index + 1}. ${achievement.name} ${achievement.icon}`);
        doc.fontSize(9).font('Helvetica');
        doc.text(`Deskripsi: ${achievement.description}`);
        doc.text(`Tanggal Dikunci: ${unlockedDate}`);
        doc.moveDown(0.5);
      });
    }

    // Footer in all pages
    const pages = doc.bufferedPageRange().count;
    for (let i = 0; i < pages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).font('Helvetica').text(`Halaman ${i + 1} dari ${pages}`, 50, doc.page.height - 30, { align: 'center' });
    }

    doc.end();
  } catch (error) {
    console.error('Export progress PDF error:', error);
    res.status(500).json({ message: 'Gagal membuat PDF' });
  }
};

// @desc    Export all users data as CSV (Admin only)
// @route   GET /api/export/users/csv
// @access  Protected (Admin)
const exportUsersCSV = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin saja yang bisa mengakses' });
    }

    const users = await User.find().lean();
    const progresses = await Progress.find().populate('user', 'username email').lean();

    // Build CSV
    let csvContent = 'LAPORAN DATA SEMUA SISWA\n\n';
    csvContent += `Tanggal Export,${new Date().toLocaleDateString('id-ID')}\n\n`;
    csvContent += `Username,Email,Role,Total Level Selesai,Rata-rata Skor,Tanggal Daftar\n`;

    for (const user of users) {
      const progress = progresses.find((p) => p.user._id.toString() === user._id.toString());
      const completedLevels = progress
        ? progress.levelProgress.filter((lp) => lp.status === 'completed').length
        : 0;
      const avgScore =
        progress && completedLevels > 0
          ? Math.round(progress.levelProgress.reduce((sum, lp) => sum + (lp.status === 'completed' ? lp.highScore : 0), 0) / completedLevels)
          : 0;
      const joinDate = new Date(user.createdAt).toLocaleDateString('id-ID');

      csvContent += `${user.username},${user.email || 'N/A'},${user.role},${completedLevels},${avgScore}%,"${joinDate}"\n`;
    }

    // Set headers
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="users_export_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export users CSV error:', error);
    res.status(500).json({ message: 'Gagal mengekspor data pengguna' });
  }
};

// @desc    Export leaderboard as CSV
// @route   GET /api/export/leaderboard/csv
// @access  Protected (Admin)
const exportLeaderboardCSV = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin saja yang bisa mengakses' });
    }

    const allProgress = await Progress.find().populate('user', 'username').lean();

    const leaderboard = allProgress
      .map((progress) => {
        const completedLevels = progress.levelProgress.filter((lp) => lp.status === 'completed').length;
        const totalScore = progress.levelProgress.reduce((sum, lp) => sum + lp.highScore, 0);
        const avgScore = completedLevels > 0 ? Math.round(totalScore / completedLevels) : 0;

        return {
          username: progress.user.username,
          completedLevels,
          avgScore,
          totalScore,
        };
      })
      .sort((a, b) => {
        if (b.completedLevels !== a.completedLevels) return b.completedLevels - a.completedLevels;
        return b.avgScore - a.avgScore;
      })
      .map((item, index) => ({ ...item, rank: index + 1 }));

    // Build CSV
    let csvContent = 'PAPAN PERINGKAT\n\n';
    csvContent += `Tanggal Export,${new Date().toLocaleDateString('id-ID')}\n\n`;
    csvContent += `Peringkat,Username,Level Selesai,Rata-rata Skor,Total Poin\n`;

    leaderboard.forEach((item) => {
      csvContent += `${item.rank},${item.username},${item.completedLevels},${item.avgScore}%,${item.totalScore}\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="leaderboard_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export leaderboard CSV error:', error);
    res.status(500).json({ message: 'Gagal mengekspor papan peringkat' });
  }
};

module.exports = {
  exportProgressCSV,
  exportProgressPDF,
  exportUsersCSV,
  exportLeaderboardCSV,
};
