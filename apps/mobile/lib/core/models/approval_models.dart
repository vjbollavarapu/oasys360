/// Approval Request Model
class ApprovalRequestModel {
  final String id;
  final String approvalType; // 'purchase_order', 'receipt', 'payment', 'contract'
  final String status; // 'pending', 'approved', 'rejected', 'cancelled'
  final String purchaseOrderId;
  final String purchaseOrderNumber;
  final String requestedById;
  final String requestedByName;
  final String? approverId;
  final String? approvedById;
  final DateTime? approvedAt;
  final String? rejectionReason;
  final String? notes;
  final double? amount;
  final DateTime createdAt;
  final DateTime updatedAt;

  ApprovalRequestModel({
    required this.id,
    required this.approvalType,
    required this.status,
    required this.purchaseOrderId,
    required this.purchaseOrderNumber,
    required this.requestedById,
    required this.requestedByName,
    this.approverId,
    this.approvedById,
    this.approvedAt,
    this.rejectionReason,
    this.notes,
    this.amount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ApprovalRequestModel.fromJson(Map<String, dynamic> json) {
    return ApprovalRequestModel(
      id: json['id']?.toString() ?? '',
      approvalType: json['approval_type'] ?? json['approvalType'] ?? '',
      status: json['status'] ?? 'pending',
      purchaseOrderId: json['purchase_order']?.toString() ?? '',
      purchaseOrderNumber: json['purchase_order_number'] ?? json['purchaseOrder']?['order_number'] ?? '',
      requestedById: json['requested_by']?.toString() ?? '',
      requestedByName: json['requested_by_name'] ?? json['requested_by']?['name'] ?? '',
      approverId: json['approver']?.toString(),
      approvedById: json['approved_by']?.toString(),
      approvedAt: json['approved_at'] != null
          ? DateTime.parse(json['approved_at'])
          : null,
      rejectionReason: json['rejection_reason'],
      notes: json['notes'],
      amount: json['amount'] != null ? (json['amount'] as num).toDouble() : null,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
    );
  }
}

/// Approval List Response
class ApprovalListResponse {
  final List<ApprovalRequestModel> approvals;
  final int count;
  final String? next;
  final String? previous;

  ApprovalListResponse({
    required this.approvals,
    required this.count,
    this.next,
    this.previous,
  });

  factory ApprovalListResponse.fromJson(Map<String, dynamic> json) {
    final results = json['results'] ?? json['data'] ?? [];
    return ApprovalListResponse(
      approvals: (results as List)
          .map((item) => ApprovalRequestModel.fromJson(item as Map<String, dynamic>))
          .toList(),
      count: json['count'] ?? results.length,
      next: json['next'],
      previous: json['previous'],
    );
  }
}

