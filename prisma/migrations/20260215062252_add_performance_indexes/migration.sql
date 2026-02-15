-- CreateIndex
CREATE INDEX "grievances_supporters_idx" ON "grievances"("supporters");

-- CreateIndex
CREATE INDEX "grievances_status_idx" ON "grievances"("status");

-- CreateIndex
CREATE INDEX "grievances_providerTarget_idx" ON "grievances"("providerTarget");

-- CreateIndex
CREATE INDEX "grievances_category_idx" ON "grievances"("category");

-- CreateIndex
CREATE INDEX "grievances_reportedBy_idx" ON "grievances"("reportedBy");

-- CreateIndex
CREATE INDEX "knowledge_createdAt_idx" ON "knowledge"("createdAt");

-- CreateIndex
CREATE INDEX "knowledge_category_idx" ON "knowledge"("category");

-- CreateIndex
CREATE INDEX "knowledge_verified_idx" ON "knowledge"("verified");

-- CreateIndex
CREATE INDEX "knowledge_contributedBy_idx" ON "knowledge"("contributedBy");

-- CreateIndex
CREATE INDEX "members_joinedAt_idx" ON "members"("joinedAt");

-- CreateIndex
CREATE INDEX "members_reputation_idx" ON "members"("reputation");

-- CreateIndex
CREATE INDEX "members_type_idx" ON "members"("type");

-- CreateIndex
CREATE INDEX "members_provider_idx" ON "members"("provider");

-- CreateIndex
CREATE INDEX "proposals_status_idx" ON "proposals"("status");

-- CreateIndex
CREATE INDEX "proposals_proposedBy_idx" ON "proposals"("proposedBy");

-- CreateIndex
CREATE INDEX "resolutions_passedAt_idx" ON "resolutions"("passedAt");
