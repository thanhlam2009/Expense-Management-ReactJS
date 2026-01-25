// Footer Component - Copy từ base.html
export default function Footer() {
  return (
    <footer className="bg-light mt-5 py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <p className="mb-0">&copy; 2025 Expense Tracker. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-end">
            <small className="text-muted">Phiên bản 1.0.0</small>
          </div>
        </div>
      </div>
    </footer>
  );
}
