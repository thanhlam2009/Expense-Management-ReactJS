import React from 'react';
import { Modal, Card, Badge, Table, Alert, Row, Col } from 'react-bootstrap';
import type {
  TrendAnalysis,
  OutlierAnalysis,
  CorrelationAnalysis,
  RatioAnalysis
} from '../../utils/analysisUtils';

interface AdvancedAnalysisModalProps {
  show: boolean;
  onHide: () => void;
  trendAnalysis: TrendAnalysis;
  outlierAnalysis: OutlierAnalysis;
  correlationAnalysis: CorrelationAnalysis;
  ratioAnalysis: RatioAnalysis;
}

const AdvancedAnalysisModal: React.FC<AdvancedAnalysisModalProps> = ({
  show,
  onHide,
  trendAnalysis,
  outlierAnalysis,
  correlationAnalysis,
  ratioAnalysis
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getTrendBadgeClass = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'danger';
      case 'decreasing': return 'success';
      case 'stable': return 'primary';
      default: return 'secondary';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <i className="fas fa-arrow-up"></i>;
      case 'decreasing': return <i className="fas fa-arrow-down"></i>;
      case 'stable': return <i className="fas fa-minus"></i>;
      default: return <i className="fas fa-question"></i>;
    }
  };

  const getCorrelationBadgeClass = (strength: string) => {
    switch (strength) {
      case 'strong': return 'success';
      case 'moderate': return 'warning';
      case 'weak': return 'secondary';
      default: return 'secondary';
    }
  };

  const getCorrelationText = (strength: string) => {
    switch (strength) {
      case 'strong': return 'Mạnh';
      case 'moderate': return 'Vừa phải';
      case 'weak': return 'Yếu';
      default: return 'Không xác định';
    }
  };

  const getStabilityAlertClass = (stability: string) => {
    switch (stability) {
      case 'very_stable': return 'success';
      case 'stable': return 'info';
      case 'unstable': return 'warning';
      default: return 'secondary';
    }
  };

  const getRatioStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'overspending': return 'danger';
      case 'high': return 'warning';
      case 'moderate': return 'info';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getRatioStatusText = (status: string) => {
    switch (status) {
      case 'overspending': return 'Chi vượt';
      case 'high': return 'Cao';
      case 'moderate': return 'Vừa phải';
      case 'low': return 'Thấp';
      default: return 'Không xác định';
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-lightbulb me-2"></i>Gợi ý chi tiêu
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          {/* Xu hướng chi tiêu */}
          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Header className="bg-warning text-dark">
                <h6 className="mb-0">
                  <i className="fas fa-chart-line me-2"></i>Xu hướng chi tiêu
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="text-center mb-3">
                  <Badge bg={getTrendBadgeClass(trendAnalysis.trend)} className="fs-6">
                    {getTrendIcon(trendAnalysis.trend)} {trendAnalysis.trend_description}
                  </Badge>
                </div>
                {trendAnalysis.monthly_changes.length > 0 && (
                  <div className="mt-3">
                    <h6>Thay đổi theo tháng:</h6>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <Table striped bordered hover size="sm">
                        <thead>
                          <tr>
                            <th>Tháng</th>
                            <th>Thay đổi</th>
                            <th>%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trendAnalysis.monthly_changes.map((change, idx) => (
                            <tr key={idx}>
                              <td>{change.month}</td>
                              <td className={change.change >= 0 ? 'text-danger' : 'text-success'}>
                                {change.change >= 0 ? '+' : ''}{formatCurrency(change.change)}
                              </td>
                              <td className={change.change >= 0 ? 'text-danger' : 'text-success'}>
                                {change.change >= 0 ? '+' : ''}{change.change_percent.toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Tháng bất thường */}
          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Header className="bg-danger text-white">
                <h6 className="mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>Tháng bất thường
                </h6>
              </Card.Header>
              <Card.Body>
                <Alert variant="info">
                  <small>{outlierAnalysis.message}</small>
                </Alert>
                {outlierAnalysis.outliers.length > 0 && (
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {outlierAnalysis.outliers.map((outlier, idx) => (
                      <div key={idx} className="mb-2 p-2 border rounded">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>{outlier.month}</strong>
                          <Badge bg={outlier.severity === 'extreme' ? 'danger' : 'warning'}>
                            {outlier.severity === 'extreme' ? 'Cực kỳ bất thường' : 'Bất thường'}
                          </Badge>
                        </div>
                        <small className="text-muted">
                          Chi tiêu: {formatCurrency(outlier.expense)}
                          {' '}({outlier.type === 'high' ? 'Cao' : 'Thấp'} hơn trung bình{' '}
                          {formatCurrency(Math.abs(outlier.deviation_from_mean))})
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Tương quan thu nhập - chi tiêu */}
          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Header className="bg-info text-white">
                <h6 className="mb-0">
                  <i className="fas fa-link me-2"></i>Tương quan thu nhập - chi tiêu
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="text-center mb-3">
                  <Row>
                    <Col xs={6}>
                      <div className="border rounded p-2">
                        <div className="h4 text-primary mb-1">
                          {(correlationAnalysis.correlation * 100).toFixed(1)}%
                        </div>
                        <small className="text-muted">Hệ số tương quan</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="border rounded p-2">
                        <div className="h6 mb-1">
                          <Badge bg={getCorrelationBadgeClass(correlationAnalysis.correlation_strength)}>
                            {getCorrelationText(correlationAnalysis.correlation_strength)}
                          </Badge>
                        </div>
                        <small className="text-muted">Mức độ</small>
                      </div>
                    </Col>
                  </Row>
                </div>
                <Alert variant="info">
                  <small>{correlationAnalysis.description}</small>
                </Alert>
              </Card.Body>
            </Card>
          </Col>

          {/* Tỷ lệ chi tiêu / thu nhập */}
          <Col md={6} className="mb-4">
            <Card className="h-100">
              <Card.Header className="bg-secondary text-white">
                <h6 className="mb-0">
                  <i className="fas fa-percentage me-2"></i>Tỷ lệ chi tiêu / thu nhập
                </h6>
              </Card.Header>
              <Card.Body>
                <Alert variant={getStabilityAlertClass(ratioAnalysis.stability)} className="text-center">
                  <strong>{ratioAnalysis.description}</strong>
                </Alert>
                {ratioAnalysis.monthly_ratios.length > 0 && (
                  <div className="mt-3">
                    <h6>Chi tiết theo tháng:</h6>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <Table striped bordered hover size="sm">
                        <thead>
                          <tr>
                            <th>Tháng</th>
                            <th>Tỷ lệ</th>
                            <th>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ratioAnalysis.monthly_ratios.map((ratio, idx) => (
                            <tr key={idx}>
                              <td>{ratio.month}</td>
                              <td>{ratio.ratio.toFixed(1)}%</td>
                              <td>
                                <Badge bg={getRatioStatusBadgeClass(ratio.status)}>
                                  {getRatioStatusText(ratio.status)}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default AdvancedAnalysisModal;
