package org.hartford.vehicle_insurance.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claim_documents")
public class ClaimDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    @JsonIgnore
    private Claim claim;

    @Column(nullable = false)
    private String fileName;

    @Column(name = "content_type", nullable = true)
    private String contentType;

    @Column(name = "file_type", nullable = true)
    private String fileType;

    @Lob
    @Column(nullable = true)
    @JsonIgnore
    private byte[] content;

    // Keep filePath for backward compatibility (file system storage)
    @Column(name = "file_path", nullable = true)
    private String filePath;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    public ClaimDocument() {
    }

    // Constructor for database storage (with content)
    public ClaimDocument(Claim claim, String fileName, String contentType, byte[] content) {
        this.claim = claim;
        this.fileName = fileName;
        this.contentType = contentType;
        this.content = content;
        this.uploadedAt = LocalDateTime.now();
    }

    // Constructor for file system storage (backward compatibility)
    public ClaimDocument(Claim claim, String fileName, String contentType, String filePath, boolean useFilePath) {
        this.claim = claim;
        this.fileName = fileName;
        this.contentType = contentType;
        this.filePath = filePath;
        this.uploadedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Claim getClaim() {
        return claim;
    }

    public void setClaim(Claim claim) {
        this.claim = claim;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public byte[] getContent() {
        return content;
    }

    public void setContent(byte[] content) {
        this.content = content;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
