package br.com.sorveteria.access.application;

public class TooManyAttemptsException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    private final long retryAfter;
    public TooManyAttemptsException(long retryAfter) {
        super("Não foi possível autenticar. Aguarde antes de tentar novamente.");
        this.retryAfter = Math.max(1, Math.min(900, retryAfter));
    }
    public long retryAfter() { return retryAfter; }
}

